let allServices = [];
let allCategories = [];
let currentBookingServiceId = null;
let calendarState = {
    selectedDate: null,
    visibleMonth: null,
    minDate: null,
    todayAvailable: true
};

async function loadServices() {
    try {
        [allServices, allCategories] = await Promise.all([
            getServicesAPI(),
            getCategoriesAPI()
        ]);
        
        populateCategoryFilter();
        displayServices(allServices);
    } catch (error) {
        console.error('Error loading services:', error);
        document.getElementById('servicesList').innerHTML = '<p>Грешка при зареждане на услугите</p>';
    }
}

function populateCategoryFilter() {
    const filter = document.getElementById('categoryFilter');
    filter.innerHTML = '<option value="">Всички категории</option>';
    allCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        filter.appendChild(option);
    });
}

function filterServices() {
    const categoryId = document.getElementById('categoryFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const sortBy = document.getElementById('sortBy').value;
    
    let filtered = [...allServices];
    
    if (categoryId) {
        filtered = filtered.filter(s => s.categoryId == categoryId);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(s => 
            s.name.toLowerCase().includes(searchTerm) ||
            (s.description && s.description.toLowerCase().includes(searchTerm))
        );
    }
    
    if (sortBy === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'category') {
        filtered.sort((a, b) => {
            const catA = allCategories.find(c => c.id === a.categoryId)?.name || '';
            const catB = allCategories.find(c => c.id === b.categoryId)?.name || '';
            return catA.localeCompare(catB);
        });
    }
    
    displayServices(filtered);
}

function displayServices(services) {
    const container = document.getElementById('servicesList');
    
    if (services.length === 0) {
        container.innerHTML = '<p>Няма намерени услуги</p>';
        return;
    }
    
    container.innerHTML = services.map(service => {
        const category = allCategories.find(c => c.id === service.categoryId);
        const priceLabel = service.price != null ? `€${Number(service.price).toFixed(2)}` : '—';
        return `
            <div class="service-card">
                <h3>${service.name}</h3>
                <div class="category">${category ? category.name : 'Без категория'}</div>
                <p>${service.description || ''}</p>
                <div class="price">Продължителност: ${service.durationMinutes} мин</div>
                <div class="price">Цена: ${priceLabel}</div>
                <button onclick="bookService(${service.id})">Запази час</button>
            </div>
        `;
    }).join('');
}

async function bookService(serviceId) {
    if (!currentUser) {
        showSection('login');
        return;
    }
    
    try {
        const service = await getServiceAPI(serviceId);
        currentBookingServiceId = serviceId;
        const hairdressers = await getHairdressersAPI();
        
        const bookingForm = document.getElementById('bookingForm');
        bookingForm.innerHTML = `
            <div class="booking-form">
                <h3>Запази: ${service.name}</h3>
                <label>Фризьор:</label>
                <select id="bookingHairdresser" onchange="handleHairdresserChange()">
                    ${hairdressers.map(h => `<option value="${h.id}">${h.name}</option>`).join('')}
                </select>
                <label>Дата:</label>
                <div class="booking-calendar">
                    <div class="calendar-header">
                        <button type="button" class="calendar-nav" onclick="changeCalendarMonth(-1)">‹</button>
                        <div id="calendarMonthLabel" class="calendar-month"></div>
                        <button type="button" class="calendar-nav" onclick="changeCalendarMonth(1)">›</button>
                    </div>
                    <div class="calendar-weekdays">
                        <span>Пн</span>
                        <span>Вт</span>
                        <span>Ср</span>
                        <span>Чт</span>
                        <span>Пт</span>
                        <span>Сб</span>
                        <span>Нд</span>
                    </div>
                    <div id="calendarDays" class="calendar-days"></div>
                    <div id="calendarSelected" class="calendar-selected"></div>
                </div>
                <input type="hidden" id="bookingDate">
                <label>Час:</label>
                <div id="timeSlots" class="time-slots"></div>
                <label>Бележки (по желание):</label>
                <textarea id="bookingNotes" rows="3"></textarea>
                <button onclick="submitBooking(${service.id})">Потвърди</button>
                <button onclick="showSection('services')" class="btn-secondary">Отказ</button>
            </div>
        `;
        
        showSection('booking');
        initCalendar();
        loadTimeSlots();
    } catch (error) {
        console.error('Error loading booking form:', error);
        alert('Грешка при зареждане на формата за записване');
    }
}

let selectedTime = null;

async function loadTimeSlots() {
    const hairdresserId = document.getElementById('bookingHairdresser').value;
    const date = document.getElementById('bookingDate').value;
    
    if (!date || !currentBookingServiceId) return;
    
    try {
        const slots = await getAvailableSlotsAPI(hairdresserId, currentBookingServiceId, new Date(date));
        const container = document.getElementById('timeSlots');
        const selectedDate = new Date(`${date}T00:00:00`);
        const now = new Date();
        const isToday = selectedDate.toDateString() === now.toDateString();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        
        if (slots.length === 0) {
            const service = allServices.find(s => s.id == currentBookingServiceId);
            const durationLabel = service ? ` (${service.durationMinutes} мин)` : '';
            container.innerHTML = `<p>Няма свободни часове за тази дата${durationLabel}. Опитайте друга дата или фризьор.</p>`;
            return;
        }
        
        container.innerHTML = slots.map(slot => {
            const timeStr = slot.substring(0, 5); // Format HH:MM
            const [hours, minutes] = timeStr.split(':').map(Number);
            const slotMinutes = hours * 60 + minutes;
            const isPast = isToday && slotMinutes <= nowMinutes;
            if (isPast) {
                return `<div class="time-slot unavailable">${timeStr}</div>`;
            }
            return `<div class="time-slot" onclick="selectTimeSlot('${timeStr}')">${timeStr}</div>`;
        }).join('');
        
        selectedTime = null;
    } catch (error) {
        console.error('Error loading time slots:', error);
        document.getElementById('timeSlots').innerHTML = '<p>Грешка при зареждане на часовете</p>';
    }
}

function selectTimeSlot(time) {
    selectedTime = time;
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
        if (slot.textContent === time) {
            slot.classList.add('selected');
        }
    });
}

function initCalendar() {
    const today = new Date();
    calendarState.minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    calendarState.selectedDate = calendarState.selectedDate || calendarState.minDate;
    calendarState.visibleMonth = new Date(calendarState.selectedDate.getFullYear(), calendarState.selectedDate.getMonth(), 1);
    updateCalendarSelection(calendarState.selectedDate);
    renderCalendar();
    updateTodayAvailability();
}

function changeCalendarMonth(direction) {
    calendarState.visibleMonth = new Date(
        calendarState.visibleMonth.getFullYear(),
        calendarState.visibleMonth.getMonth() + direction,
        1
    );
    renderCalendar();
}

function renderCalendar() {
    const monthLabel = document.getElementById('calendarMonthLabel');
    const daysContainer = document.getElementById('calendarDays');
    if (!monthLabel || !daysContainer) return;

    const monthNames = [
        'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
        'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'
    ];
    const year = calendarState.visibleMonth.getFullYear();
    const month = calendarState.visibleMonth.getMonth();
    monthLabel.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const leadingEmpty = (firstDay.getDay() + 6) % 7;
    const totalDays = lastDay.getDate();

    const fragments = [];
    for (let i = 0; i < leadingEmpty; i += 1) {
        fragments.push('<span class="calendar-day empty"></span>');
    }

    for (let day = 1; day <= totalDays; day += 1) {
        const dateObj = new Date(year, month, day);
        const dateStr = formatDateValue(dateObj);
        const isPast = dateObj < calendarState.minDate;
        const isToday = dateObj.toDateString() === calendarState.minDate.toDateString();
        const isTodayUnavailable = isToday && !calendarState.todayAvailable;
        const isSelected = calendarState.selectedDate &&
            formatDateValue(calendarState.selectedDate) === dateStr;
        const classNames = [
            'calendar-day',
            (isPast || isTodayUnavailable) ? 'disabled' : '',
            isSelected ? 'selected' : ''
        ].filter(Boolean).join(' ');
        const clickHandler = (isPast || isTodayUnavailable) ? '' : `onclick="selectCalendarDate('${dateStr}')"`; 
        fragments.push(`<button type="button" class="${classNames}" ${clickHandler}>${day}</button>`);
    }

    daysContainer.innerHTML = fragments.join('');
}

async function updateTodayAvailability() {
    if (!currentBookingServiceId) return;
    const hairdresserId = document.getElementById('bookingHairdresser')?.value;
    if (!hairdresserId) return;

    const today = new Date();
    const nowMinutes = today.getHours() * 60 + today.getMinutes();
    const slots = await getAvailableSlotsAPI(hairdresserId, currentBookingServiceId, today);
    const hasFutureSlot = slots.some(slot => {
        const [hours, minutes] = slot.substring(0, 5).split(':').map(Number);
        return hours * 60 + minutes > nowMinutes;
    });

    calendarState.todayAvailable = hasFutureSlot;

    const selectedIsToday = calendarState.selectedDate &&
        calendarState.selectedDate.toDateString() === today.toDateString();
    if (!hasFutureSlot && selectedIsToday) {
        const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        calendarState.selectedDate = tomorrow;
        calendarState.visibleMonth = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), 1);
        updateCalendarSelection(tomorrow);
    }

    renderCalendar();
}

function handleHairdresserChange() {
    updateTodayAvailability();
    loadTimeSlots();
}

function selectCalendarDate(dateStr) {
    const parts = dateStr.split('-').map(Number);
    calendarState.selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);
    updateCalendarSelection(calendarState.selectedDate);
    renderCalendar();
    loadTimeSlots();
}

function updateCalendarSelection(dateObj) {
    const hiddenInput = document.getElementById('bookingDate');
    const selectedLabel = document.getElementById('calendarSelected');
    if (!hiddenInput || !selectedLabel) return;
    hiddenInput.value = formatDateValue(dateObj);
    selectedLabel.textContent = `Избрана дата: ${dateObj.toLocaleDateString('bg-BG')}`;
}

function formatDateValue(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function submitBooking(serviceId) {
    if (!selectedTime) {
        alert('Моля, изберете час');
        return;
    }
    
    const hairdresserId = document.getElementById('bookingHairdresser').value;
    const date = document.getElementById('bookingDate').value;
    const notes = document.getElementById('bookingNotes').value;
    
    const [hours, minutes] = selectedTime.split(':');
    const appointmentTime = `${hours}:${minutes}:00`;
    
    try {
        await createAppointmentAPI({
            serviceId: parseInt(serviceId),
            hairdresserId: parseInt(hairdresserId),
            appointmentDate: date,
            appointmentTime: appointmentTime,
            notes: notes
        });
        
        alert('Часът е запазен!');
        showSection('bookings');
        loadBookings();
    } catch (error) {
        alert(error.message || 'Грешка при записване на час');
    }
}

// Reload time slots when hairdresser changes
document.addEventListener('DOMContentLoaded', () => {
    // This will be attached dynamically
});
