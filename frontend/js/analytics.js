async function loadAnalytics() {
    if (!currentUser || currentUser.role !== 'admin') {
        document.getElementById('analyticsContent').innerHTML = '<p>Достъпът е отказан</p>';
        return;
    }
    
    try {
        const analytics = await getAnalyticsAPI();
        displayAnalytics(analytics);
    } catch (error) {
        console.error('Error loading analytics:', error);
        document.getElementById('analyticsContent').innerHTML = '<p>Грешка при зареждане на аналитиката</p>';
    }
}

function displayAnalytics(analytics) {
    const container = document.getElementById('analyticsContent');
    
    container.innerHTML = `
        <div class="analytics-container">
            <div class="stat-card">
                <h3>${analytics.totalAppointments}</h3>
                <p>Общо резервации</p>
            </div>
            <div class="stat-card">
                <h3>${analytics.scheduledAppointments}</h3>
                <p>Планирани</p>
            </div>
            <div class="stat-card">
                <h3>${analytics.completedAppointments}</h3>
                <p>Завършени</p>
            </div>
            <div class="stat-card">
                <h3>${analytics.cancelledAppointments}</h3>
                <p>Отказани</p>
            </div>
            <div class="stat-card">
                <h3>€${analytics.totalRevenue?.toFixed(2) || '0.00'}</h3>
                <p>Общи приходи</p>
            </div>
        </div>
        <h3 style="margin-top: 2rem;">Популярни услуги</h3>
        <div class="services-grid">
            ${analytics.popularServices?.map(service => `
                <div class="service-card">
                    <h3>${service.serviceName}</h3>
                    <p>Резервации: ${service.count}</p>
                    <p>Приходи: €${service.revenue?.toFixed(2) || '0.00'}</p>
                </div>
            `).join('') || '<p>Няма налични данни</p>'}
        </div>
    `;
}
