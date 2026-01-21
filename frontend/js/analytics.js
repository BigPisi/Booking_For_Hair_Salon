let analyticsState = {
    period: 'all',
    analytics: null,
    appointments: []
};

async function loadAnalytics() {
    if (!currentUser || currentUser.role !== 'admin') {
        document.getElementById('analyticsContent').innerHTML = '<p>Достъпът е отказан</p>';
        return;
    }

    try {
        const [analytics, appointments] = await Promise.all([
            getAnalyticsAPI(),
            getAllAppointmentsAPI()
        ]);
        analyticsState = {
            period: 'all',
            analytics,
            appointments: appointments || []
        };
        renderAnalytics();
    } catch (error) {
        console.error('Error loading analytics:', error);
        document.getElementById('analyticsContent').innerHTML = '<p>Грешка при зареждане на аналитиката</p>';
    }
}

function renderAnalytics() {
    const container = document.getElementById('analyticsContent');
    if (!container) return;

    const { analytics } = analyticsState;
    const popularServices = (analytics?.popularServices || []).slice(0, 3);
    const maxPopularCount = Math.max(...popularServices.map(s => s.count || 0), 0);

    container.innerHTML = `
        <div class="analytics-header">
            <div>
                <h2>Аналитика</h2>
                <p>Преглед на резервации и приходи за салона.</p>
            </div>
            <div class="analytics-filter">
                <span>Период:</span>
                <div class="filter-buttons">
                    <button type="button" class="filter-btn ${analyticsState.period === 'today' ? 'active' : ''}" data-period="today">Днес</button>
                    <button type="button" class="filter-btn ${analyticsState.period === 'week' ? 'active' : ''}" data-period="week">Тази седмица</button>
                    <button type="button" class="filter-btn ${analyticsState.period === 'month' ? 'active' : ''}" data-period="month">Този месец</button>
                    <button type="button" class="filter-btn ${analyticsState.period === 'all' ? 'active' : ''}" data-period="all">Всичко време</button>
                </div>
            </div>
        </div>
        <div class="analytics-grid">
            <div class="analytics-kpis">
                <div class="stat-card primary">
                    <h3>${analytics?.totalAppointments || 0}</h3>
                    <p>Общо резервации</p>
                </div>
                <div class="stat-card primary revenue">
                    <h3>€${analytics?.totalRevenue?.toFixed(2) || '0.00'}</h3>
                    <p>Общи приходи</p>
                </div>
                <div class="stat-card success">
                    <h3>${analytics?.completedAppointments || 0}</h3>
                    <p>Завършени</p>
                </div>
                <div class="stat-card danger">
                    <h3>${analytics?.cancelledAppointments || 0}</h3>
                    <p>Отказани</p>
                </div>
                <div class="stat-card neutral">
                    <h3>${analytics?.scheduledAppointments || 0}</h3>
                    <p>Планирани</p>
                </div>
            </div>
            <div class="analytics-panels">
                <div class="analytics-panel">
                    <div class="panel-header">
                        <h3>Популярни услуги</h3>
                        <span class="panel-subtitle">Топ 3 услуги</span>
                    </div>
                    ${popularServices.length ? `
                        <div class="popular-list">
                            ${popularServices.map((service, index) => {
                                const pct = maxPopularCount ? Math.round((service.count / maxPopularCount) * 100) : 0;
                                return `
                                    <div class="popular-item">
                                        <div class="popular-title">
                                            <span class="rank">${index + 1}.</span>
                                            <span>${service.serviceName}</span>
                                        </div>
                                        <div class="popular-meta">
                                            <span>Резервации: ${service.count}</span>
                                            <span>Приходи: €${service.revenue?.toFixed(2) || '0.00'}</span>
                                        </div>
                                        <div class="popular-bar">
                                            <span style="width:${pct}%"></span>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    ` : `<p class="panel-empty">Няма налични данни за услуги.</p>`}
                </div>
                <div class="analytics-panel chart-panel">
                    <div class="panel-header">
                        <h3>Резервации по период</h3>
                        <span class="panel-subtitle">${getChartSubtitle()}</span>
                    </div>
                    <div class="chart-bars">
                        ${renderChartBars()}
                    </div>
                </div>
            </div>
        </div>
    `;

    container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            analyticsState.period = btn.dataset.period;
            renderAnalytics();
        });
    });
}

function getChartSubtitle() {
    switch (analyticsState.period) {
        case 'today':
            return 'Днес';
        case 'week':
            return 'Последните 7 дни';
        case 'month':
            return 'Последните 30 дни';
        case 'all':
        default:
            return 'Последните 6 месеца';
    }
}

function renderChartBars() {
    const data = buildChartData();
    const maxValue = Math.max(...data.map(item => item.count), 0);

    if (!data.length || maxValue === 0) {
        return '<p class="panel-empty">Няма данни за избрания период.</p>';
    }

    return data.map(item => {
        const height = Math.max(8, Math.round((item.count / maxValue) * 100));
        return `
            <div class="chart-bar">
                <span class="bar" style="height:${height}%"></span>
                <span class="label">${item.label}</span>
                <span class="value">${item.count}</span>
            </div>
        `;
    }).join('');
}

function buildChartData() {
    const appointments = analyticsState.appointments || [];
    const now = new Date();
    if (analyticsState.period === 'all') {
        return buildMonthlyCounts(appointments, now, 6);
    }

    let days;
    switch (analyticsState.period) {
        case 'today':
            days = 1;
            break;
        case 'week':
            days = 7;
            break;
        case 'month':
            days = 30;
            break;
        default:
            days = 7;
            break;
    }

    return buildDailyCounts(appointments, now, days);
}

function buildDailyCounts(appointments, endDate, days) {
    const results = [];
    const map = {};
    for (let i = days - 1; i >= 0; i -= 1) {
        const date = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - i);
        const key = date.toISOString().slice(0, 10);
        map[key] = 0;
        results.push({ label: `${date.getDate()}.${String(date.getMonth() + 1).padStart(2, '0')}`, key, count: 0 });
    }

    appointments.forEach(apt => {
        const key = new Date(apt.appointmentDate).toISOString().slice(0, 10);
        if (map[key] !== undefined) {
            map[key] += 1;
        }
    });

    return results.map(item => ({
        label: item.label,
        count: map[item.key] || 0
    }));
}

function buildMonthlyCounts(appointments, endDate, months) {
    const results = [];
    const map = {};
    for (let i = months - 1; i >= 0; i -= 1) {
        const date = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        map[key] = 0;
        results.push({ label: date.toLocaleString('bg-BG', { month: 'short' }), key, count: 0 });
    }

    appointments.forEach(apt => {
        const date = new Date(apt.appointmentDate);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (map[key] !== undefined) {
            map[key] += 1;
        }
    });

    return results.map(item => ({
        label: item.label,
        count: map[item.key] || 0
    }));
}
