package com.salon.repository;

import com.salon.model.Hairdresser;
import com.salon.model.WorkingHours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkingHoursRepository extends JpaRepository<WorkingHours, Long> {
    List<WorkingHours> findByHairdresser(Hairdresser hairdresser);
    Optional<WorkingHours> findByHairdresserAndDayOfWeek(Hairdresser hairdresser, Integer dayOfWeek);
    List<WorkingHours> findByHairdresserId(Long hairdresserId);
}
