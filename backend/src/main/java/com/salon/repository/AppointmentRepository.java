package com.salon.repository;

import com.salon.model.Appointment;
import com.salon.model.Hairdresser;
import com.salon.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByUser(User user);
    List<Appointment> findByHairdresser(Hairdresser hairdresser);
    List<Appointment> findByUserOrderByAppointmentDateDescAppointmentTimeDesc(User user);
    
    @Query("SELECT a FROM Appointment a WHERE a.hairdresser = :hairdresser " +
           "AND a.appointmentDate = :date AND a.status = 'scheduled'")
    List<Appointment> findScheduledByHairdresserAndDate(
        @Param("hairdresser") Hairdresser hairdresser,
        @Param("date") LocalDate date
    );
    
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.status = :status")
    Long countByStatus(@Param("status") String status);
}
