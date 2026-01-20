package com.salon.service;

import com.salon.dto.AppointmentRequest;
import com.salon.model.Appointment;
import com.salon.model.Hairdresser;
import com.salon.model.User;
import com.salon.model.WorkingHours;
import com.salon.repository.AppointmentRepository;
import com.salon.repository.HairdresserRepository;
import com.salon.repository.ServiceRepository;
import com.salon.repository.WorkingHoursRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class AppointmentService {
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private ServiceRepository serviceRepository;
    
    @Autowired
    private HairdresserRepository hairdresserRepository;
    
    @Autowired
    private WorkingHoursRepository workingHoursRepository;
    
    public List<Appointment> getUserAppointments(Long userId) {
        User user = userService.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return appointmentRepository.findByUserOrderByAppointmentDateDescAppointmentTimeDesc(user);
    }
    
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }
    
    @Transactional
    public Appointment createAppointment(Long userId, AppointmentRequest request) {
        User user = userService.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        com.salon.model.Service service = serviceRepository.findById(request.getServiceId())
            .orElseThrow(() -> new RuntimeException("Service not found"));
        Hairdresser hairdresser = hairdresserRepository.findById(request.getHairdresserId())
            .orElseThrow(() -> new RuntimeException("Hairdresser not found"));
        
        // Check if slot is available
        if (!isSlotAvailable(hairdresser, request.getAppointmentDate(), request.getAppointmentTime(), service.getDurationMinutes())) {
            throw new RuntimeException("Time slot is not available");
        }
        
        Appointment appointment = new Appointment();
        appointment.setUser(user);
        appointment.setService(service);
        appointment.setHairdresser(hairdresser);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setAppointmentTime(request.getAppointmentTime());
        appointment.setNotes(request.getNotes());
        appointment.setStatus("scheduled");
        
        return appointmentRepository.save(appointment);
    }
    
    @Transactional
    public Appointment cancelAppointment(Long appointmentId, Long userId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        if (!appointment.getUser().getId().equals(userId) && !isAdmin(userId)) {
            throw new RuntimeException("Not authorized to cancel this appointment");
        }
        
        appointment.setStatus("cancelled");
        return appointmentRepository.save(appointment);
    }
    
    public List<LocalTime> getAvailableSlots(Long hairdresserId, Long serviceId, LocalDate date) {
        Hairdresser hairdresser = hairdresserRepository.findById(hairdresserId)
            .orElseThrow(() -> new RuntimeException("Hairdresser not found"));
        com.salon.model.Service service = serviceRepository.findById(serviceId)
            .orElseThrow(() -> new RuntimeException("Service not found"));
        
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        int dayValue = dayOfWeek.getValue() % 7; // Convert to 0-6 format (0=Sunday)
        
        WorkingHours workingHours = workingHoursRepository
            .findByHairdresserAndDayOfWeek(hairdresser, dayValue)
            .orElse(null);
        
        if (workingHours == null || !workingHours.getIsAvailable()) {
            return List.of();
        }
        
        List<Appointment> existingAppointments = appointmentRepository
            .findScheduledByHairdresserAndDate(hairdresser, date);
        
        LocalTime start = workingHours.getStartTime().toLocalTime();
        LocalTime end = workingHours.getEndTime().toLocalTime();
        int durationMinutes = service.getDurationMinutes();

        if (start.plusMinutes(durationMinutes).isAfter(end)) {
            return List.of();
        }

        List<LocalTime> slots = generateTimeSlots(start, end, 30); // 30-minute slots
        
        // Filter out booked slots
        return slots.stream()
            .filter(slot -> !slot.plusMinutes(durationMinutes).isAfter(end))
            .filter(slot -> isSlotFree(slot, existingAppointments, durationMinutes))
            .collect(Collectors.toList());
    }
    
    private boolean isSlotAvailable(Hairdresser hairdresser, LocalDate date, LocalTime time, int durationMinutes) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        int dayValue = dayOfWeek.getValue() % 7;
        
        WorkingHours workingHours = workingHoursRepository
            .findByHairdresserAndDayOfWeek(hairdresser, dayValue)
            .orElse(null);
        
        if (workingHours == null || !workingHours.getIsAvailable()) {
            return false;
        }
        
        LocalTime start = workingHours.getStartTime().toLocalTime();
        LocalTime end = workingHours.getEndTime().toLocalTime();
        
        if (time.isBefore(start) || time.plusMinutes(durationMinutes).isAfter(end)) {
            return false;
        }
        
        List<Appointment> existingAppointments = appointmentRepository
            .findScheduledByHairdresserAndDate(hairdresser, date);
        
        return isSlotFree(time, existingAppointments, durationMinutes);
    }
    
    private boolean isSlotFree(LocalTime slot, List<Appointment> appointments, int duration) {
        LocalTime slotEnd = slot.plusMinutes(duration);
        for (Appointment apt : appointments) {
            LocalTime aptStart = apt.getAppointmentTime();
            LocalTime aptEnd = aptStart.plusMinutes(apt.getService().getDurationMinutes());
            
            if (slot.isBefore(aptEnd) && slotEnd.isAfter(aptStart)) {
                return false;
            }
        }
        return true;
    }
    
    private List<LocalTime> generateTimeSlots(LocalTime start, LocalTime end, int intervalMinutes) {
        return IntStream.iterate(0, i -> i + intervalMinutes)
            .mapToObj(start::plusMinutes)
            .takeWhile(time -> time.plusMinutes(intervalMinutes).isBefore(end) || time.plusMinutes(intervalMinutes).equals(end))
            .collect(Collectors.toList());
    }
    
    private boolean isAdmin(Long userId) {
        return userService.findById(userId)
            .map(u -> "admin".equals(u.getRole()))
            .orElse(false);
    }
}
