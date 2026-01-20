function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.body.dataset.activeSection = sectionId;
    
    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
        
        // Load section-specific content
        if (sectionId === 'services') {
            loadServices();
        } else if (sectionId === 'bookings') {
            loadBookings();
        } else if (sectionId === 'admin') {
            loadAdmin();
        } else if (sectionId === 'analytics') {
            loadAnalytics();
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    showSection('home');
});
