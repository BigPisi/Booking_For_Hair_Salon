package com.salon.controller;

import com.salon.dto.AppointmentDTO;
import com.salon.dto.TimeOffRequest;
import com.salon.model.Appointment;
import com.salon.model.Hairdresser;
import com.salon.model.HairdresserTimeOff;
import com.salon.model.User;
import com.salon.repository.AppointmentRepository;
import com.salon.repository.HairdresserRepository;
import com.salon.repository.HairdresserTimeOffRepository;
import com.salon.service.AppointmentService;
import com.salon.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('STAFF')")
public class StaffController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private HairdresserRepository hairdresserRepository;

    @Autowired
    private HairdresserTimeOffRepository hairdresserTimeOffRepository;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Long hairdresserId = user.getHairdresserId();
        if (hairdresserId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Hairdresser not linked"));
        }
        return hairdresserRepository.findById(hairdresserId)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Hairdresser not found")));
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentDTO>> getAppointments(
        Authentication authentication,
        @RequestParam(required = false) LocalDate date
    ) {
        User user = (User) authentication.getPrincipal();
        Long hairdresserId = user.getHairdresserId();
        if (hairdresserId == null) {
            return ResponseEntity.ok(List.of());
        }

        Hairdresser hairdresser = hairdresserRepository.findById(hairdresserId)
            .orElse(null);
        if (hairdresser == null) {
            return ResponseEntity.ok(List.of());
        }

        List<Appointment> appointments = date == null
            ? appointmentRepository.findByHairdresser(hairdresser)
            : appointmentRepository.findByAppointmentDateOrderByAppointmentTimeAsc(date)
                .stream()
                .filter(apt -> apt.getHairdresser().getId().equals(hairdresserId))
                .collect(Collectors.toList());

        List<AppointmentDTO> dtos = appointments.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/appointments/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Appointment appointment = appointmentService.cancelAppointment(id, user.getId());
            return ResponseEntity.ok(convertToDTO(appointment));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/time-off")
    public ResponseEntity<List<HairdresserTimeOff>> getTimeOff(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Long hairdresserId = user.getHairdresserId();
        if (hairdresserId == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(hairdresserTimeOffRepository.findByHairdresserId(hairdresserId));
    }

    @PostMapping("/time-off")
    public ResponseEntity<?> createTimeOff(
        @Valid @RequestBody TimeOffRequest request,
        Authentication authentication
    ) {
        try {
            User user = (User) authentication.getPrincipal();
            Long hairdresserId = user.getHairdresserId();
            if (hairdresserId == null) {
                throw new RuntimeException("Hairdresser not linked");
            }
            if (request.getDate() == null || request.getStartTime() == null || request.getEndTime() == null) {
                throw new RuntimeException("Date and time are required");
            }
            if (!request.getEndTime().isAfter(request.getStartTime())) {
                throw new RuntimeException("End time must be after start time");
            }

            Hairdresser hairdresser = hairdresserRepository.findById(hairdresserId)
                .orElseThrow(() -> new RuntimeException("Hairdresser not found"));

            HairdresserTimeOff timeOff = new HairdresserTimeOff();
            timeOff.setHairdresser(hairdresser);
            timeOff.setDate(request.getDate());
            timeOff.setStartTime(request.getStartTime());
            timeOff.setEndTime(request.getEndTime());
            timeOff.setReason(request.getReason());

            return ResponseEntity.status(HttpStatus.CREATED).body(hairdresserTimeOffRepository.save(timeOff));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping("/time-off/{id}")
    public ResponseEntity<?> updateTimeOff(
        @PathVariable Long id,
        @Valid @RequestBody TimeOffRequest request,
        Authentication authentication
    ) {
        try {
            User user = (User) authentication.getPrincipal();
            Long hairdresserId = user.getHairdresserId();
            if (hairdresserId == null) {
                throw new RuntimeException("Hairdresser not linked");
            }
            if (request.getDate() == null || request.getStartTime() == null || request.getEndTime() == null) {
                throw new RuntimeException("Date and time are required");
            }
            if (!request.getEndTime().isAfter(request.getStartTime())) {
                throw new RuntimeException("End time must be after start time");
            }

            HairdresserTimeOff timeOff = hairdresserTimeOffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Time off not found"));
            if (!timeOff.getHairdresser().getId().equals(hairdresserId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Not authorized"));
            }

            timeOff.setDate(request.getDate());
            timeOff.setStartTime(request.getStartTime());
            timeOff.setEndTime(request.getEndTime());
            timeOff.setReason(request.getReason());

            return ResponseEntity.ok(hairdresserTimeOffRepository.save(timeOff));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @DeleteMapping("/time-off/{id}")
    public ResponseEntity<?> deleteTimeOff(@PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Long hairdresserId = user.getHairdresserId();
        if (hairdresserId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Hairdresser not linked"));
        }

        var timeOffOpt = hairdresserTimeOffRepository.findById(id);
        if (timeOffOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Time off not found"));
        }
        HairdresserTimeOff timeOff = timeOffOpt.get();
        if (!timeOff.getHairdresser().getId().equals(hairdresserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Not authorized"));
        }
        hairdresserTimeOffRepository.delete(timeOff);
        return ResponseEntity.noContent().build();
    }

    private AppointmentDTO convertToDTO(Appointment appointment) {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(appointment.getId());
        dto.setUserId(appointment.getUser().getId());
        dto.setUserName(appointment.getUser().getUsername());
        dto.setServiceId(appointment.getService().getId());
        dto.setServiceName(appointment.getService().getName());
        dto.setHairdresserId(appointment.getHairdresser().getId());
        dto.setHairdresserName(appointment.getHairdresser().getName());
        dto.setAppointmentDate(appointment.getAppointmentDate());
        dto.setAppointmentTime(appointment.getAppointmentTime());
        dto.setStatus(appointment.getStatus());
        dto.setNotes(appointment.getNotes());
        return dto;
    }
}
