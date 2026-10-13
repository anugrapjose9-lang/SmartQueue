const CUSTOMER_API = 'http://localhost:8080/api/customer';

function customerToken() {
    return localStorage.getItem('smartQueueToken');
}

function requireCustomer() {
    if (!customerToken() || localStorage.getItem('smartQueueRole') !== 'CUSTOMER') {
        localStorage.removeItem('smartQueueToken');
        localStorage.removeItem('smartQueueRole');
        localStorage.removeItem('smartQueueName');
        window.location.replace('login.html');
        return false;
    }
    return true;
}

async function customerFetch(path, options = {}) {
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${customerToken()}`);

    if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${CUSTOMER_API}${path}`, {
        ...options,
        headers
    });

    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('smartQueueToken');
        localStorage.removeItem('smartQueueRole');
        localStorage.removeItem('smartQueueName');
        window.location.replace('login.html');
        throw new Error('Your session expired or you do not have customer access.');
    }

    return response;
}

document.addEventListener('DOMContentLoaded', () => {
    if (!requireCustomer()) return;

    const nameInput = document.getElementById('customerName');

    if (nameInput) {
        nameInput.value = localStorage.getItem('smartQueueName') || '';
    }

    document.getElementById('logoutBtn')
        ?.addEventListener('click', logoutCustomer);

    document.getElementById('ticketForm')
        ?.addEventListener('submit', handleCreateTicket);

    document.getElementById('refreshQueueBtn')
        ?.addEventListener('click', fetchLiveQueue);

    document.getElementById('cancelTicketBtn')
        ?.addEventListener('click', () => {
            localStorage.removeItem('smartQueueTicket');
            document.getElementById('ticketTrackerSection')
                ?.classList.add('d-none');
        });

    fetchLiveQueue();
    setInterval(fetchLiveQueue, 10000);

    const savedTicketNumber = localStorage.getItem('smartQueueTicket');

    if (savedTicketNumber) {
        trackTicketByNumber(savedTicketNumber);
    }
});

function logoutCustomer() {
    localStorage.removeItem('smartQueueToken');
    localStorage.removeItem('smartQueueRole');
    localStorage.removeItem('smartQueueName');
    localStorage.removeItem('smartQueueTicket');

    window.location.replace('login.html');
}

async function handleCreateTicket(event) {
    event.preventDefault();

    const button = document.getElementById('submitTicketBtn');
    button.disabled = true;
    button.textContent = 'Generating Ticket...';

    const payload = {
        serviceType: document.getElementById('serviceType').value,
        priority: document.getElementById('priority').value,
        estimatedServiceTime:
            parseInt(document.getElementById('estimatedServiceTime').value, 10) || 10
    };

    try {
        const response = await customerFetch('/tickets', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || 'Failed to generate ticket.');
        }

        const ticket = await response.json();

        localStorage.setItem('smartQueueTicket', ticket.ticketNumber);

        showToast(
            `Ticket ${ticket.ticketNumber} successfully generated!`,
            'success'
        );

        updateTrackerUI(ticket);
        await fetchLiveQueue();

        document.getElementById('ticketForm').reset();
        document.getElementById('customerName').value =
            localStorage.getItem('smartQueueName') || '';

        document.getElementById('estimatedServiceTime').value = 10;
    } catch (error) {
        console.error('Error creating ticket:', error);
        showToast(error.message || 'Unable to create ticket.', 'danger');
    } finally {
        button.disabled = false;
        button.textContent = 'Generate Digital Ticket';
    }
}

async function fetchLiveQueue() {
    const tableBody = document.getElementById('liveQueueTableBody');
    if (!tableBody) return;

    try {
        const response = await customerFetch('/queue');

        if (!response.ok) {
            throw new Error('Failed to fetch queue.');
        }

        const tickets = await response.json();
        const activeTicketNo = localStorage.getItem('smartQueueTicket');

        if (activeTicketNo) {
            const currentTicket = tickets.find(
                ticket => ticket.ticketNumber === activeTicketNo
            );

            if (currentTicket) {
                updateTrackerUI(currentTicket);
            } else {
                await trackTicketByNumber(activeTicketNo);
            }
        }

        if (!tickets.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4 text-muted">
                        No customers are currently waiting.
                    </td>
                </tr>`;
            return;
        }

        tableBody.innerHTML = tickets.map((ticket, index) => {
            const priorityBadge = ticket.priority === 'HIGH'
                ? '<span class="badge bg-danger">HIGH</span>'
                : ticket.priority === 'NORMAL'
                    ? '<span class="badge bg-primary">NORMAL</span>'
                    : '<span class="badge bg-secondary">LOW</span>';

            const statusBadge = ticket.status === 'SERVING'
                ? '<span class="badge bg-success">SERVING</span>'
                : ticket.status === 'COMPLETED'
                    ? '<span class="badge bg-secondary">COMPLETED</span>'
                    : '<span class="badge bg-warning text-dark">WAITING</span>';

            return `
                <tr>
                    <td class="ps-4 fw-bold">
                        #${ticket.queuePosition ?? index + 1}
                    </td>
                    <td>
                        <strong class="text-primary">
                            ${escapeHtml(ticket.ticketNumber || '-')}
                        </strong>
                    </td>
                    <td>${escapeHtml(ticket.customerName || '-')}</td>
                    <td>${escapeHtml(ticket.serviceType || '-')}</td>
                    <td>${priorityBadge}</td>
                    <td>${ticket.estimatedWaitingTime ?? '-'} min</td>
                    <td class="pe-4 text-end">${statusBadge}</td>
                </tr>`;
        }).join('');

    } catch (error) {
        console.error('Error fetching live queue:', error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-danger">
                    Unable to load queue. Check that the backend is running
                    and you are signed in.
                </td>
            </tr>`;
    }
}

async function trackTicketByNumber(ticketNumber) {
    try {
        const response = await customerFetch('/tickets');

        if (!response.ok) return;

        const tickets = await response.json();

        const ticket = tickets.find(
            item => item.ticketNumber === ticketNumber
        );

        if (ticket) {
            updateTrackerUI(ticket);
        }
    } catch (error) {
        console.error('Unable to track ticket:', error);
    }
}

function updateTrackerUI(ticket) {
    const section = document.getElementById('ticketTrackerSection');
    if (!section) return;

    section.classList.remove('d-none');

    document.getElementById('trackerTicketNumber').textContent =
        ticket.ticketNumber || '-';

    document.getElementById('trackerCustomerName').textContent =
        ticket.customerName || localStorage.getItem('smartQueueName') || '-';

    document.getElementById('trackerServiceType').textContent =
        ticket.serviceType || '-';

    document.getElementById('trackerPosition').textContent =
        ticket.queuePosition != null ? `#${ticket.queuePosition}` : '-';

    const waitTime = ticket.estimatedWaitingTime ?? 0;

    document.getElementById('trackerWaitTime').textContent =
        `${waitTime} min`;

    const expectedTime = new Date(Date.now() + waitTime * 60000);

    document.getElementById('trackerExpectedTime').textContent =
        expectedTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

    const badge = document.getElementById('trackerStatusBadge');
    badge.textContent = ticket.status || 'UNKNOWN';

    badge.className = 'badge fs-6 px-3 py-2 mb-3 ' +
        (ticket.status === 'SERVING'
            ? 'bg-success'
            : ticket.status === 'WAITING'
                ? 'bg-warning text-dark'
                : 'bg-secondary');

    const banner = document.getElementById('smartAlertBanner');
    const text = document.getElementById('smartAlertText');

    if (ticket.status === 'SERVING') {
        banner.className =
            'alert alert-success border-0 shadow-sm mt-3 mb-0 d-flex align-items-center gap-3';

        text.textContent =
            "It's your turn now! Please proceed to the service counter.";

    } else if (ticket.status === 'COMPLETED') {
        banner.className =
            'alert alert-secondary border-0 shadow-sm mt-3 mb-0 d-flex align-items-center gap-3';

        text.textContent = 'Your service is complete.';

    } else if (waitTime <= 5) {
        banner.className =
            'alert alert-warning border-0 shadow-sm mt-3 mb-0 d-flex align-items-center gap-3';

        text.textContent =
            `Your turn may be approaching. Estimated wait: ${waitTime} minutes.`;

    } else {
        banner.className =
            'alert alert-info border-0 shadow-sm mt-3 mb-0 d-flex align-items-center gap-3';

        text.textContent =
            `You are in the queue. Estimated wait: ${waitTime} minutes.`;
    }
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const id = 'toast-' + Date.now();

    const background = type === 'success'
        ? 'bg-success text-white'
        : 'bg-danger text-white';

    container.insertAdjacentHTML('beforeend', `
        <div id="${id}" class="toast align-items-center ${background} border-0 shadow"
             role="alert">
            <div class="d-flex">
                <div class="toast-body fw-medium">${escapeHtml(message)}</div>
                <button type="button"
                        class="btn-close btn-close-white me-2 m-auto"
                        data-bs-dismiss="toast"
                        aria-label="Close"></button>
            </div>
        </div>`);

    const toastElement = document.getElementById(id);
    const toast = new bootstrap.Toast(toastElement, { delay: 4000 });

    toast.show();
    toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
}