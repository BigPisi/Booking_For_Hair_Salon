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
    if (!confirm('Сигурни ли сте, че искате да отмените този час?')) {
        return;
    }
    
    try {
        await cancelAppointmentAPI(appointmentId);
        loadBookings();
        alert('Часът е отменен');
    } catch (error) {
        alert(error.message || 'Грешка при отказване на час');
    }
}
