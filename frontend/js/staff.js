async function loadStaffSchedule() {
    if (!currentUser || currentUser.role !== 'staff') {
        const list = document.getElementById('staffScheduleList');
        if (list) {
            list.innerHTML = '<p>Достъпът е отказан</p>';
        }
        return;
    }

    if (!staffOffCalendarState.selectedDate) {
        initStaffOffCalendar();
    }
    initStaffTimeOptions();
    loadStaffTimeOff();

    try {
        const appointments = await getStaffAppointmentsAPI();
        renderStaffSchedule(appointments || []);
    } catch (error) {
        const list = document.getElementById('staffScheduleList');
        if (list) {
            list.innerHTML = '<p>Грешка при зареждане на графика</p>';
        }
    }
}

let staffTimeOptionsReady = false;

function initStaffTimeOptions() {
    if (staffTimeOptionsReady) return;
    staffTimeOptionsReady = true;
    const startSelect = document.getElementById('staffOffStart');
    const endSelect = document.getElementById('staffOffEnd');
    if (!startSelect || !endSelect) return;

    const options = buildTimeOptions('09:00', '19:00', 30);
    startSelect.innerHTML = renderTimeOptions(options, 'Начало');
    endSelect.innerHTML = renderTimeOptions(options, 'Край');
}

function buildTimeOptions(start, end, stepMinutes) {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    const items = [];
    for (let minutes = startTotal; minutes <= endTotal; minutes += stepMinutes) {
        const h = String(Math.floor(minutes / 60)).padStart(2, '0');
        const m = String(minutes % 60).padStart(2, '0');
        items.push(`${h}:${m}`);
    }
    return items;
}

function renderTimeOptions(options, placeholder) {
    const placeholderOption = `<option value="">${placeholder}</option>`;
    const rows = options.map(value => `<option value="${value}">${value}</option>`).join('');
    return `${placeholderOption}${rows}`;
}

let staffOffCalendarState = {
    selectedDate: null,
    visibleMonth: null
};
let staffOffCalendarBound = false;
let staffOffEditingId = null;

function initStaffOffCalendar() {
    const today = new Date();
    staffOffCalendarState.selectedDate = staffOffCalendarState.selectedDate || today;
    staffOffCalendarState.visibleMonth = new Date(
        staffOffCalendarState.selectedDate.getFullYear(),
        staffOffCalendarState.selectedDate.getMonth(),
        1
    );
    updateStaffOffCalendarSelection(staffOffCalendarState.selectedDate);
    renderStaffOffCalendar();
    bindStaffOffCalendarEvents();
}

function bindStaffOffCalendarEvents() {
    if (staffOffCalendarBound) return;
    staffOffCalendarBound = true;

    document.addEventListener('click', (event) => {
        const popover = document.getElementById('staffOffCalendarPopover');
        const picker = document.querySelector('.staff-date-picker');
        if (!popover || !picker) return;
        if (!picker.contains(event.target)) {
            popover.classList.remove('open');
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        const popover = document.getElementById('staffOffCalendarPopover');
        if (popover) {
            popover.classList.remove('open');
        }
    });
}

function toggleStaffOffCalendar() {
    if (!staffOffCalendarState.selectedDate) {
        initStaffOffCalendar();
    }
    const popover = document.getElementById('staffOffCalendarPopover');
    if (!popover) return;
    popover.classList.toggle('open');
}

function changeStaffOffCalendarMonth(direction) {
    staffOffCalendarState.visibleMonth = new Date(
        staffOffCalendarState.visibleMonth.getFullYear(),
        staffOffCalendarState.visibleMonth.getMonth() + direction,
        1
    );
    renderStaffOffCalendar();
}

function renderStaffOffCalendar() {
    const monthLabel = document.getElementById('staffOffCalendarMonthLabel');
    const daysContainer = document.getElementById('staffOffCalendarDays');
    if (!monthLabel || !daysContainer) return;

    const monthNames = [
        'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
        'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'
    ];
    const year = staffOffCalendarState.visibleMonth.getFullYear();
    const month = staffOffCalendarState.visibleMonth.getMonth();
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
        const dateStr = formatStaffOffDateValue(dateObj);
        const isSelected = staffOffCalendarState.selectedDate &&
            formatStaffOffDateValue(staffOffCalendarState.selectedDate) === dateStr;
        const classNames = [
            'calendar-day',
            isSelected ? 'selected' : ''
        ].filter(Boolean).join(' ');
        fragments.push(
            `<button type="button" class="${classNames}" onclick="selectStaffOffCalendarDate('${dateStr}')">${day}</button>`
        );
    }

    daysContainer.innerHTML = fragments.join('');
}

function selectStaffOffCalendarDate(dateStr) {
    const parts = dateStr.split('-').map(Number);
    staffOffCalendarState.selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);
    updateStaffOffCalendarSelection(staffOffCalendarState.selectedDate);
    renderStaffOffCalendar();
    const popover = document.getElementById('staffOffCalendarPopover');
    if (popover) {
        popover.classList.remove('open');
    }
}

function updateStaffOffCalendarSelection(dateObj) {
    const hiddenInput = document.getElementById('staffOffDate');
    const selectedLabel = document.getElementById('staffOffCalendarSelected');
    const displayButton = document.getElementById('staffOffDateDisplay');
    if (!hiddenInput || !selectedLabel || !displayButton) return;
    hiddenInput.value = formatStaffOffDateValue(dateObj);
    const displayText = dateObj.toLocaleDateString('bg-BG');
    selectedLabel.textContent = `Избрана дата: ${displayText}`;
    displayButton.textContent = displayText;
}

function formatStaffOffDateValue(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function renderStaffSchedule(appointments) {
    const list = document.getElementById('staffScheduleList');
    if (!list) return;

    if (!appointments.length) {
        list.innerHTML = '<p>Няма предстоящи записвания</p>';
        return;
    }

    list.innerHTML = appointments.map(apt => {
        const date = new Date(apt.appointmentDate).toLocaleDateString('bg-BG');
        const time = apt.appointmentTime.substring(0, 5);
        const canCancel = apt.status === 'scheduled';
        const statusKey = normalizeStaffStatus(apt.status);
        const statusLabel = getStaffStatusLabel(statusKey);
        return `
            <div class="staff-appointment">
                <div>
                    <h4>${apt.serviceName}</h4>
                    <p>Клиент: ${apt.userName}</p>
                    <p>Дата: ${date} в ${time}</p>
                    ${apt.notes ? `<p>Бележки: ${apt.notes}</p>` : ''}
                </div>
                <div>
                    <span class="status ${statusKey}">${statusLabel}</span>
                    ${canCancel ? `<button class="btn-secondary" onclick="cancelStaffBooking(${apt.id})">Откажи</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function normalizeStaffStatus(status) {
    if (!status) return 'scheduled';
    const value = String(status).toLowerCase();
    if (value === 'cancelled' || value === 'canceled') {
        return 'cancelled';
    }
    if (value === 'completed') {
        return 'completed';
    }
    return 'scheduled';
}

function getStaffStatusLabel(status) {
    if (status === 'completed') {
        return 'Завършена';
    }
    if (status === 'cancelled') {
        return 'Отказана';
    }
    return 'Планирана';
}

async function cancelStaffBooking(appointmentId) {
    const confirmed = await showConfirmModal('Сигурни ли сте, че искате да отмените този час?');
    if (!confirmed) return;

    try {
        await cancelStaffAppointmentAPI(appointmentId);
        loadStaffSchedule();
        showInfoModal('Часът е отменен');
    } catch (error) {
        showInfoModal(error.message || 'Грешка при отказване на час');
    }
}

async function saveTimeOff() {
    const date = document.getElementById('staffOffDate')?.value;
    const startTime = document.getElementById('staffOffStart')?.value;
    const endTime = document.getElementById('staffOffEnd')?.value;
    const reason = document.getElementById('staffOffReason')?.value;
    const message = document.getElementById('staffOffMessage');

    if (message) {
        message.textContent = '';
    }

    if (!date || !startTime || !endTime) {
        if (message) {
            message.textContent = 'Моля, попълнете дата и час.';
        }
        return;
    }
    if (endTime <= startTime) {
        if (message) {
            message.textContent = 'Крайният час трябва да е след началния.';
        }
        return;
    }

    try {
        const payload = {
            date,
            startTime,
            endTime,
            reason: reason || ''
        };
        if (staffOffEditingId) {
            await updateStaffTimeOffAPI(staffOffEditingId, payload);
        } else {
            await createStaffTimeOffAPI(payload);
        }
        if (message) {
            message.textContent = staffOffEditingId
                ? 'Почивните часове са обновени.'
                : 'Почивните часове са запазени.';
        }
        resetTimeOffForm();
        loadStaffTimeOff();
        loadStaffSchedule();
    } catch (error) {
        if (message) {
            const errorText = error?.message || '';
            if (errorText.includes('End time must be after start time')) {
                message.textContent = 'Крайният час трябва да е след началния.';
            } else if (errorText.includes('Date and time are required')) {
                message.textContent = 'Моля, попълнете дата и час.';
            } else {
                message.textContent = errorText || 'Грешка при записване на почивни часове.';
            }
        }
    }
}

async function loadStaffTimeOff() {
    const list = document.getElementById('staffTimeOffList');
    if (!list) return;
    try {
        const timeOffs = await getStaffTimeOffAPI();
        renderStaffTimeOffList(timeOffs || []);
    } catch (error) {
        list.innerHTML = '<p>Грешка при зареждане на почивните часове.</p>';
    }
}

function renderStaffTimeOffList(timeOffs) {
    const list = document.getElementById('staffTimeOffList');
    if (!list) return;
    if (!timeOffs.length) {
        list.innerHTML = '<p>Няма записани почивни часове.</p>';
        return;
    }

    const sorted = [...timeOffs].sort((a, b) => {
        const dateA = `${a.date} ${a.startTime || ''}`;
        const dateB = `${b.date} ${b.startTime || ''}`;
        return dateA.localeCompare(dateB);
    });

    list.innerHTML = sorted.map(entry => {
        const date = new Date(entry.date).toLocaleDateString('bg-BG');
        const start = entry.startTime?.substring(0, 5) || '';
        const end = entry.endTime?.substring(0, 5) || '';
        const reason = entry.reason ? `<p>Причина: ${entry.reason}</p>` : '';
        return `
            <div class="timeoff-item">
                <div>
                    <h4>${date}</h4>
                    <p>${start} - ${end}</p>
                    ${reason}
                </div>
                <div class="timeoff-actions">
                    <button class="btn-secondary" onclick="editTimeOff(${entry.id})">Редакция</button>
                    <button class="btn-primary" onclick="deleteTimeOff(${entry.id})">Изтрий</button>
                </div>
            </div>
        `;
    }).join('');
}

async function editTimeOff(id) {
    try {
        const timeOffs = await getStaffTimeOffAPI();
        const entry = (timeOffs || []).find(item => item.id === id);
        if (!entry) return;
        staffOffEditingId = id;
        const dateObj = new Date(entry.date);
        updateStaffOffCalendarSelection(dateObj);
        renderStaffOffCalendar();
        const startSelect = document.getElementById('staffOffStart');
        const endSelect = document.getElementById('staffOffEnd');
        if (startSelect) startSelect.value = entry.startTime?.substring(0, 5) || '';
        if (endSelect) endSelect.value = entry.endTime?.substring(0, 5) || '';
        const reasonInput = document.getElementById('staffOffReason');
        if (reasonInput) reasonInput.value = entry.reason || '';
        const cancelBtn = document.getElementById('staffOffCancelEdit');
        if (cancelBtn) cancelBtn.style.display = 'inline-flex';
        const message = document.getElementById('staffOffMessage');
        if (message) message.textContent = '';
    } catch (error) {
        const message = document.getElementById('staffOffMessage');
        if (message) {
            message.textContent = 'Грешка при зареждане на почивните часове.';
        }
    }
}

async function deleteTimeOff(id) {
    const confirmed = await showConfirmModal('Сигурни ли сте, че искате да изтриете този почивен час?');
    if (!confirmed) return;
    try {
        await deleteStaffTimeOffAPI(id);
        if (staffOffEditingId === id) {
            resetTimeOffForm();
        }
        loadStaffTimeOff();
        loadStaffSchedule();
    } catch (error) {
        const message = document.getElementById('staffOffMessage');
        if (message) {
            message.textContent = error.message || 'Грешка при изтриване на почивните часове.';
        }
    }
}

function cancelTimeOffEdit() {
    resetTimeOffForm();
}

function resetTimeOffForm() {
    staffOffEditingId = null;
    const today = new Date();
    updateStaffOffCalendarSelection(today);
    renderStaffOffCalendar();
    const startSelect = document.getElementById('staffOffStart');
    const endSelect = document.getElementById('staffOffEnd');
    if (startSelect) startSelect.value = '';
    if (endSelect) endSelect.value = '';
    const reasonInput = document.getElementById('staffOffReason');
    if (reasonInput) reasonInput.value = '';
    const cancelBtn = document.getElementById('staffOffCancelEdit');
    if (cancelBtn) cancelBtn.style.display = 'none';
}
