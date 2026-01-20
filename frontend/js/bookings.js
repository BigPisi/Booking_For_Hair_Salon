async function loadBookings() {
    if (!currentUser) {
        document.getElementById('bookingsList').innerHTML = '<p>Моля, влезте, за да видите резервациите</p>';
        return;
    }
    
    try {
        const appointments = await getAppointmentsAPI();
        displayBookings(appointments);
    } catch (error) {
        console.error('Error loading bookings:', error);
        document.getElementById('bookingsList').innerHTML = '<p>Грешка при зареждане на резервациите</p>';
    }
}

function displayBookings(appointments) {
    const container = document.getElementById('bookingsList');
    
    if (appointments.length === 0) {
        container.innerHTML = '<p>Нямате резервации</p>';
        return;
    }

    const statusLabels = {
        scheduled: 'Планирана',
        completed: 'Завършена',
        cancelled: 'Отказана'
    };
    
    container.innerHTML = appointments.map(apt => {
        const date = new Date(apt.appointmentDate).toLocaleDateString();
        const time = apt.appointmentTime.substring(0, 5);
        const canCancel = apt.status === 'scheduled';
        const statusLabel = statusLabels[apt.status] || apt.status;
        
        return `
            <div class="booking-item">
                <div class="info">
                    <h3>${apt.serviceName}</h3>
                    <p>Фризьор: ${apt.hairdresserName}</p>
                    <p>Дата: ${date} в ${time}</p>
                    ${apt.notes ? `<p>Бележки: ${apt.notes}</p>` : ''}
                </div>
                <div>
                    <span class="status ${apt.status}">${statusLabel}</span>
                    ${canCancel ? `<button onclick="cancelBooking(${apt.id})">Откажи</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

async function cancelBooking(appointmentId) {
    const confirmed = await showConfirmModal('Сигурни ли сте, че искате да отмените този час?');
    if (!confirmed) {
        return;
    }
    
    try {
        await cancelAppointmentAPI(appointmentId);
        loadBookings();
        showInfoModal('Часът е отменен');
    } catch (error) {
        showInfoModal(error.message || 'Грешка при отказване на час');
    }
}

function showConfirmModal(message) {
    const modal = document.getElementById('confirmModal');
    const messageEl = document.getElementById('confirmModalMessage');
    const yesBtn = document.getElementById('confirmModalYes');
    const noBtn = document.getElementById('confirmModalNo');

    if (!modal || !messageEl || !yesBtn || !noBtn) {
        return Promise.resolve(window.confirm(message));
    }

    messageEl.textContent = message;
    modal.style.display = 'flex';

    return new Promise(resolve => {
        const cleanup = () => {
            modal.style.display = 'none';
            yesBtn.onclick = null;
            noBtn.onclick = null;
        };

        yesBtn.onclick = () => {
            cleanup();
            resolve(true);
        };
        noBtn.onclick = () => {
            cleanup();
            resolve(false);
        };
    });
}

function showInfoModal(message) {
    const modal = document.getElementById('infoModal');
    const messageEl = document.getElementById('infoModalMessage');
    const okBtn = document.getElementById('infoModalOk');

    if (!modal || !messageEl || !okBtn) {
        alert(message);
        return;
    }

    messageEl.textContent = message;
    modal.style.display = 'flex';

    okBtn.onclick = () => {
        modal.style.display = 'none';
        okBtn.onclick = null;
    };
}
