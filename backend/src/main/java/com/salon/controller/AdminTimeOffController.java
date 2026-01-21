package com.salon.controller;

import com.salon.dto.TimeOffDTO;
import com.salon.model.HairdresserTimeOff;
import com.salon.repository.HairdresserTimeOffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/time-off")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminTimeOffController {

    @Autowired
    private HairdresserTimeOffRepository hairdresserTimeOffRepository;

    @GetMapping
    public ResponseEntity<List<TimeOffDTO>> getTimeOff(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate effectiveDate = date != null ? date : LocalDate.now();
        List<HairdresserTimeOff> timeOffs = hairdresserTimeOffRepository.findByDateOrderByStartTimeAsc(effectiveDate);
        List<TimeOffDTO> dtos = timeOffs.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    private TimeOffDTO convertToDTO(HairdresserTimeOff timeOff) {
        TimeOffDTO dto = new TimeOffDTO();
        dto.setId(timeOff.getId());
        dto.setHairdresserId(timeOff.getHairdresser().getId());
        dto.setHairdresserName(timeOff.getHairdresser().getName());
        dto.setDate(timeOff.getDate());
        dto.setStartTime(timeOff.getStartTime());
        dto.setEndTime(timeOff.getEndTime());
        dto.setReason(timeOff.getReason());
        return dto;
    }
}
