package com.salon.service;

import com.salon.dto.AnalyticsDTO;
import com.salon.model.Appointment;
import com.salon.model.ServicePrice;
import com.salon.repository.AppointmentRepository;
import com.salon.repository.ServicePriceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private ServicePriceRepository servicePriceRepository;
    
    public AnalyticsDTO getAnalytics() {
        AnalyticsDTO analytics = new AnalyticsDTO();
        
        List<Appointment> allAppointments = appointmentRepository.findAll();
        
        analytics.setTotalAppointments((long) allAppointments.size());
        analytics.setScheduledAppointments(appointmentRepository.countByStatus("scheduled"));
        analytics.setCompletedAppointments(appointmentRepository.countByStatus("completed"));
        analytics.setCancelledAppointments(appointmentRepository.countByStatus("cancelled"));
        
        // Calculate revenue from completed appointments
        BigDecimal totalRevenue = allAppointments.stream()
            .filter(a -> "completed".equals(a.getStatus()))
            .map(this::getAppointmentPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        analytics.setTotalRevenue(totalRevenue);
        
        // Appointments by status
        Map<String, Long> statusMap = new HashMap<>();
        statusMap.put("scheduled", analytics.getScheduledAppointments());
        statusMap.put("completed", analytics.getCompletedAppointments());
        statusMap.put("cancelled", analytics.getCancelledAppointments());
        analytics.setAppointmentsByStatus(statusMap);
        
        // Popular services
        Map<String, Long> serviceCounts = allAppointments.stream()
            .filter(a -> "completed".equals(a.getStatus()) || "scheduled".equals(a.getStatus()))
            .collect(Collectors.groupingBy(
                a -> a.getService().getName(),
                Collectors.counting()
            ));
        
        Map<String, BigDecimal> serviceRevenue = allAppointments.stream()
            .filter(a -> "completed".equals(a.getStatus()))
            .collect(Collectors.groupingBy(
                a -> a.getService().getName(),
                Collectors.reducing(BigDecimal.ZERO, this::getAppointmentPrice, BigDecimal::add)
            ));
        
        List<AnalyticsDTO.ServiceStats> popularServices = serviceCounts.entrySet().stream()
            .map(entry -> {
                AnalyticsDTO.ServiceStats stats = new AnalyticsDTO.ServiceStats();
                stats.setServiceName(entry.getKey());
                stats.setCount(entry.getValue());
                stats.setRevenue(serviceRevenue.getOrDefault(entry.getKey(), BigDecimal.ZERO));
                return stats;
            })
            .sorted((a, b) -> Long.compare(b.getCount(), a.getCount()))
            .limit(10)
            .collect(Collectors.toList());
        
        analytics.setPopularServices(popularServices);
        
        return analytics;
    }
    
    private BigDecimal getAppointmentPrice(Appointment appointment) {
        var priceOpt = servicePriceRepository.findByServiceAndHairdresser(
            appointment.getService(), appointment.getHairdresser());
        if (priceOpt.isPresent()) {
            return priceOpt.get().getPrice();
        }
        // Fallback: get any price for this service
        List<ServicePrice> servicePrices = servicePriceRepository.findByService(appointment.getService());
        if (!servicePrices.isEmpty()) {
            return servicePrices.get(0).getPrice();
        }
        return BigDecimal.ZERO;
    }
}
