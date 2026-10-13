const STAFF_API = 'http://localhost:8080/api/staff';

function requireStaff() {
    if (!localStorage.getItem('smartQueueToken') ||
        localStorage.getItem('smartQueueRole') !== 'STAFF') {

        localStorage.removeItem('smartQueueToken');
        localStorage.removeItem('smartQueueRole');
        localStorage.removeItem('smartQueueName');

        window.location.replace('login.html');
        return false;
    }

    return true;
}

async function staffFetch(path, options = {}) {
    const headers = new Headers(options.headers || {});

    headers.set(
        'Authorization',
        `Bearer ${localStorage.getItem('smartQueueToken')}`
    );

    if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${STAFF_API}${path}`, {
        ...options,
        headers
    });

    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('smartQueueToken');
        localStorage.removeItem('smartQueueRole');
        localStorage.removeItem('smartQueueName');

        window.location.replace('login.html');

        throw new Error('Your session expired or you do not have staff access.');
    }

    return response;
}

document.addEventListener('DOMContentLoaded', () => {
    if (!requireStaff()) return;

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('smartQueueToken');
        localStorage.removeItem('smartQueueRole');
        localStorage.removeItem('smartQueueName');

        window.location.replace('login.html');
    });

    loadDashboardData();

    setInterval(loadDashboardData, 10000);

    document.getElementById('serveNextBtn')
        .addEventListener('click', handleServeNext);

    document.getElementById('refreshStaffBtn')
        .addEventListener('click', loadDashboardData);
});

async function loadDashboardData() {
    try {
        const statsResponse = await staffFetch('/dashboard');

        if (!statsResponse.ok) {
            throw new Error('Unable to fetch dashboard statistics.');
        }

        const stats = await statsResponse.json();

        document.getElementById('statTotal').textContent =
            stats.totalTickets ?? 0;

        document.getElementById('statWaiting').textContent =
            stats.waitingTickets ?? 0;

        document.getElementById('statServing').textContent =
            stats.servingTickets ?? 0;

        document.getElementById('statCompleted').textContent =
            stats.completedTickets ?? 0;

        const response = await staffFetch('/tickets');

        if (!response.ok) {
            throw new Error('Failed to fetch tickets.');
        }

        renderStaffTable(await response.json());

    } catch (error) {
        console.error('Error loading staff dashboard:', error);

        document.getElementById('staffQueueTableBody').innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-danger">
                    ${escapeHtml(error.message || 'Unable to connect to SmartQueue.')}
                </td>
            </tr>`;
    }
}

function renderStaffTable(tickets) {
    const body = document.getElementById('staffQueueTableBody');

    if (!tickets || tickets.length === 0) {
        body.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">
                    No tickets found in database.
                </td>
            </tr>`;
        return;
    }

    body.innerHTML = tickets.map(ticket => {
        const priority = ticket.priority === 'HIGH'
            ? '<span class="badge bg-danger">HIGH</span>'
            : ticket.priority === 'NORMAL'
                ? '<span class="badge bg-primary">NORMAL</span>'
                : '<span class="badge bg-secondary">LOW</span>';

        const status = ticket.status === 'WAITING'
            ? '<span class="badge bg-warning text-dark">WAITING</span>'
            : ticket.status === 'SERVING'
                ? '<span class="badge bg-success">SERVING</span>'
                : '<span class="badge bg-secondary">COMPLETED</span>';

        const arrival = ticket.arrivalTime
            ? new Date(ticket.arrivalTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            })
            : '-';

        const action =
            ticket.status === 'WAITING' || ticket.status === 'SERVING'
                ? `<button data-ticket-id="${Number(ticket.id)}"
                           class="btn btn-sm btn-outline-success fw-medium complete-ticket-btn">
                       <i class="bi bi-check-lg me-1"></i>Complete
                   </button>`
                : '<span class="text-muted small">Closed</span>';

        return `
            <tr>
                <td class="ps-4">
                    <strong class="text-primary">
                        ${escapeHtml(ticket.ticketNumber || '-')}
                    </strong>
                </td>
                <td>${escapeHtml(ticket.customerName || '-')}</td>
                <td>${escapeHtml(ticket.serviceType || '-')}</td>
                <td>${priority}</td>
                <td>${arrival}</td>
                <td>${status}</td>
                <td class="pe-4 text-end">${action}</td>
            </tr>`;
    }).join('');

    body.querySelectorAll('.complete-ticket-btn').forEach(button => {
        button.addEventListener('click', () => {
            completeTicket(button.dataset.ticketId);
        });
    });
}

async function handleServeNext() {
    const button = document.getElementById('serveNextBtn');
    button.disabled = true;

    try {
        const response = await staffFetch('/serve-next', {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error(
                await response.text() || 'No waiting tickets available.'
            );
        }

        const ticket = await response.json();

        showToast(
            `Now serving ${ticket.ticketNumber} (${ticket.customerName})`,
            'success'
        );

        await loadDashboardData();

    } catch (error) {
        showToast(
            error.message || 'Unable to serve next ticket.',
            'danger'
        );
    } finally {
        button.disabled = false;
    }
}

async function completeTicket(id) {
    try {
        const response = await staffFetch(
            `/tickets/${encodeURIComponent(id)}/complete`,
            { method: 'PUT' }
        );

        if (!response.ok) {
            throw new Error(
                await response.text() || 'Failed to complete ticket.'
            );
        }

        showToast(`Ticket ${id} marked as completed.`, 'success');

        await loadDashboardData();

    } catch (error) {
        showToast(
            error.message || 'Failed to complete ticket.',
            'danger'
        );
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