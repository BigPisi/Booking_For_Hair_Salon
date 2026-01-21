package com.salon.repository;

import com.salon.model.Hairdresser;
import com.salon.model.HairdresserTimeOff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface HairdresserTimeOffRepository extends JpaRepository<HairdresserTimeOff, Long> {
    List<HairdresserTimeOff> findByHairdresserAndDate(Hairdresser hairdresser, LocalDate date);
    List<HairdresserTimeOff> findByHairdresserId(Long hairdresserId);
    List<HairdresserTimeOff> findByHairdresserIdAndDate(Long hairdresserId, LocalDate date);
    List<HairdresserTimeOff> findByDateOrderByStartTimeAsc(LocalDate date);
}
