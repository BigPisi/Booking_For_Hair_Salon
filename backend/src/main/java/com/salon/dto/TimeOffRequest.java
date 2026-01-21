package com.salon.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class TimeOffRequest {
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String reason;
}
