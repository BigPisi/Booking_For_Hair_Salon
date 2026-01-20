package com.salon.repository;

import com.salon.model.Hairdresser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HairdresserRepository extends JpaRepository<Hairdresser, Long> {
    List<Hairdresser> findByIsActiveTrue();
    List<Hairdresser> findByNameContainingIgnoreCase(String name);
}
