const AUTH_URL = 'http://localhost:8080/api/auth';

function showMessage(message, type = 'danger') {
    const element = document.getElementById('message');

    element.textContent = message;
    element.className = `alert alert-${type}`;
}

function redirectForRole(role) {
    if (role === 'CUSTOMER') {
        window.location.replace('index.html');

    } else if (role === 'STAFF') {
        window.location.replace('staff.html');

    } else {
        localStorage.removeItem('smartQueueToken');
        localStorage.removeItem('smartQueueRole');
        localStorage.removeItem('smartQueueName');

        showMessage('Unrecognized account role. Please sign in again.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const existingToken = localStorage.getItem('smartQueueToken');
    const existingRole = localStorage.getItem('smartQueueRole');

    if (existingToken && existingRole) {
        redirectForRole(existingRole);
    }

    // Login form
    document.getElementById('loginForm').addEventListener('submit', async event => {
        event.preventDefault();

        const button = document.getElementById('loginButton');
        button.disabled = true;

        try {
            const response = await fetch(`${AUTH_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: document.getElementById('loginEmail').value.trim(),
                    password: document.getElementById('loginPassword').value
                })
            });

            if (!response.ok) {
                throw new Error('Invalid email or password.');
            }

            const data = await response.json();

            if (!data.token || !data.role) {
                throw new Error('Incomplete login response.');
            }

            localStorage.setItem('smartQueueToken', data.token);
            localStorage.setItem('smartQueueRole', data.role);
            localStorage.setItem('smartQueueName', data.name || '');

            redirectForRole(data.role);

        } catch (error) {
            showMessage(error.message || 'Unable to connect to the server.');
        } finally {
            button.disabled = false;
        }
    });

    // Customer registration form
    document.getElementById('registerForm').addEventListener('submit', async event => {
        event.preventDefault();

        const button = document.getElementById('registerButton');
        button.disabled = true;

        try {
            const body = new URLSearchParams({
                name: document.getElementById('registerName').value.trim(),
                email: document.getElementById('registerEmail').value.trim(),
                password: document.getElementById('registerPassword').value
            });

            const response = await fetch(`${AUTH_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: body.toString()
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Registration failed.');
            }

            showMessage(
                'Account created! Sign in using your new credentials.',
                'success'
            );

            document.getElementById('loginEmail').value =
                document.getElementById('registerEmail').value.trim();

            document.getElementById('loginPassword').focus();
            document.getElementById('registerForm').reset();

        } catch (error) {
            showMessage(error.message || 'Unable to register.');
        } finally {
            button.disabled = false;
        }
    });
}); 