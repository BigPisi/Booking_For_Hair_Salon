let adminCalendarState = {
    selectedDate: null,
    visibleMonth: null
};
let adminCalendarBound = false;

async function loadAdminSchedule() {
    if (!currentUser || currentUser.role !== 'admin') {
        const list = document.getElementById('adminScheduleList');
        if (list) {
            list.innerHTML = '<p>Достъпът е отказан</p>';
        }
        return;
    }

    if (!adminCalendarState.selectedDate) {
        initAdminCalendar();
    }

    const dateInput = document.getElementById('adminScheduleDate');
    const date = dateInput?.value || formatAdminDateValue(adminCalendarState.selectedDate || new Date());
    if (dateInput && !dateInput.value) {
        dateInput.value = date;
    }

    try {
        const [appointments, timeOffs] = await Promise.all([
            getAdminScheduleAPI(date),
            getAdminTimeOffAPI(date)
        ]);
        renderAdminSchedule(appointments || [], date);
        renderAdminTimeOff(timeOffs || [], date);
    } catch (error) {
        const list = document.getElementById('adminScheduleList');
        if (list) {
            list.innerHTML = '<p>Грешка при зареждане на графика</p>';
        }
        const timeOffList = document.getElementById('adminTimeOffList');
        if (timeOffList) {
            timeOffList.innerHTML = '<p>Грешка при зареждане на почивните часове.</p>';
        }
    }
}

function initAdminCalendar() {
    const today = new Date();
    adminCalendarState.selectedDate = adminCalendarState.selectedDate || today;
    adminCalendarState.visibleMonth = new Date(
        adminCalendarState.selectedDate.getFullYear(),
        adminCalendarState.selectedDate.getMonth(),
        1
    );
    updateAdminCalendarSelection(adminCalendarState.selectedDate);
    renderAdminCalendar();
    bindAdminCalendarEvents();
}

function bindAdminCalendarEvents() {
    if (adminCalendarBound) return;
    adminCalendarBound = true;

    document.addEventListener('click', (event) => {
        const popover = document.getElementById('adminCalendarPopover');
        const picker = document.getElementById('adminScheduleDateDisplay')?.closest('.schedule-date-picker');
        if (!popover || !picker) return;
        if (!picker.contains(event.target)) {
            popover.classList.remove('open');
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        const popover = document.getElementById('adminCalendarPopover');
        if (popover) {
            popover.classList.remove('open');
        }
    });
}

function toggleAdminCalendar() {
    if (!adminCalendarState.selectedDate) {
        initAdminCalendar();
    }
    const popover = document.getElementById('adminCalendarPopover');
    if (!popover) return;
    popover.classList.toggle('open');
}

function changeAdminCalendarMonth(direction) {
    adminCalendarState.visibleMonth = new Date(
        adminCalendarState.visibleMonth.getFullYear(),
        adminCalendarState.visibleMonth.getMonth() + direction,
        1
    );
    renderAdminCalendar();
}

function renderAdminCalendar() {
    const monthLabel = document.getElementById('adminCalendarMonthLabel');
    const daysContainer = document.getElementById('adminCalendarDays');
    if (!monthLabel || !daysContainer) return;

    const monthNames = [
        'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
        'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'
    ];
    const year = adminCalendarState.visibleMonth.getFullYear();
    const month = adminCalendarState.visibleMonth.getMonth();
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
        const dateStr = formatAdminDateValue(dateObj);
        const isSelected = adminCalendarState.selectedDate &&
            formatAdminDateValue(adminCalendarState.selectedDate) === dateStr;
        const classNames = [
            'calendar-day',
            isSelected ? 'selected' : ''
        ].filter(Boolean).join(' ');
        fragments.push(
            `<button type="button" class="${classNames}" onclick="selectAdminCalendarDate('${dateStr}')">${day}</button>`
        );
    }

    daysContainer.innerHTML = fragments.join('');
}

function selectAdminCalendarDate(dateStr) {
    const parts = dateStr.split('-').map(Number);
    adminCalendarState.selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);
    updateAdminCalendarSelection(adminCalendarState.selectedDate);
    renderAdminCalendar();
    const popover = document.getElementById('adminCalendarPopover');
    if (popover) {
        popover.classList.remove('open');
    }
    loadAdminSchedule();
}

function updateAdminCalendarSelection(dateObj) {
    const hiddenInput = document.getElementById('adminScheduleDate');
    const selectedLabel = document.getElementById('adminCalendarSelected');
    const displayButton = document.getElementById('adminScheduleDateDisplay');
    if (!hiddenInput || !selectedLabel || !displayButton) return;
    hiddenInput.value = formatAdminDateValue(dateObj);
    const displayText = dateObj.toLocaleDateString('bg-BG');
    selectedLabel.textContent = `Избрана дата: ${displayText}`;
    displayButton.textContent = displayText;
}

function formatAdminDateValue(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function renderAdminSchedule(appointments, date) {
    const list = document.getElementById('adminScheduleList');
    if (!list) return;

    if (!appointments.length) {
        list.innerHTML = `<p>Няма записвания за ${new Date(date).toLocaleDateString('bg-BG')}.</p>`;
        return;
    }

    const grouped = appointments.reduce((acc, apt) => {
        const key = apt.hairdresserName || 'Без име';
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(apt);
        return acc;
    }, {});

    list.innerHTML = Object.entries(grouped).map(([hairdresserName, items]) => {
        const rows = items.map(apt => {
            const time = apt.appointmentTime.substring(0, 5);
            const statusKey = normalizeAdminStatus(apt.status);
            const statusLabel = getAdminStatusLabel(statusKey);
            return `
                <div class="schedule-row">
                    <span class="schedule-time">${time}</span>
                    <span class="schedule-service">${apt.serviceName}</span>
                    <span class="schedule-client">${apt.userName}</span>
                    <span class="status ${statusKey}">${statusLabel}</span>
                </div>
            `;
        }).join('');

        return `
            <div class="schedule-group">
                <h3>${hairdresserName}</h3>
                <div class="schedule-table">
                    ${rows}
                </div>
            </div>
        `;
    }).join('');
}

function renderAdminTimeOff(timeOffs, date) {
    const list = document.getElementById('adminTimeOffList');
    if (!list) return;
    if (!timeOffs.length) {
        const label = new Date(date).toLocaleDateString('bg-BG');
        list.innerHTML = `<p>Няма почивки за ${label}.</p>`;
        return;
    }

    const grouped = timeOffs.reduce((acc, item) => {
        const key = item.hairdresserName || 'Без име';
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {});

    list.innerHTML = Object.entries(grouped).map(([hairdresserName, items]) => {
        const rows = items.map(entry => {
            const start = entry.startTime?.substring(0, 5) || '';
            const end = entry.endTime?.substring(0, 5) || '';
            const reason = entry.reason ? `<p>Причина: ${entry.reason}</p>` : '';
            return `
                <div class="timeoff-item">
                    <div>
                        <h4>${hairdresserName}</h4>
                        <p>${start} - ${end}</p>
                        ${reason}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="timeoff-group">
                ${rows}
            </div>
        `;
    }).join('');
}

function normalizeAdminStatus(status) {
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

function getAdminStatusLabel(status) {
    if (status === 'completed') {
        return 'Завършена';
    }
    if (status === 'cancelled') {
        return 'Отказана';
    }
    return 'Планирана';
}
