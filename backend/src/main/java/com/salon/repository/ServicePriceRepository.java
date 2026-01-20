package com.salon.repository;

import com.salon.model.Hairdresser;
import com.salon.model.Service;
import com.salon.model.ServicePrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ServicePriceRepository extends JpaRepository<ServicePrice, Long> {
    List<ServicePrice> findByService(Service service);
    Optional<ServicePrice> findByServiceAndHairdresserIsNull(Service service);
    List<ServicePrice> findByHairdresser(Hairdresser hairdresser);
    Optional<ServicePrice> findByServiceAndHairdresser(Service service, Hairdresser hairdresser);
    List<ServicePrice> findByServiceId(Long serviceId);
    List<ServicePrice> findByHairdresserId(Long hairdresserId);
}
