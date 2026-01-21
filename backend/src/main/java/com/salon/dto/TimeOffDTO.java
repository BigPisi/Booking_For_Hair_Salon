package com.salon.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class TimeOffDTO {
    private Long id;
    private Long hairdresserId;
    private String hairdresserName;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String reason;
}
