package com.salon.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class AnalyticsDTO {
    private Long totalAppointments;
    private Long scheduledAppointments;
    private Long completedAppointments;
    private Long cancelledAppointments;
    private BigDecimal totalRevenue;
    private Map<String, Long> appointmentsByStatus;
    private List<ServiceStats> popularServices;
    
    @Data
    public static class ServiceStats {
        private String serviceName;
        private Long count;
        private BigDecimal revenue;
    }
}
