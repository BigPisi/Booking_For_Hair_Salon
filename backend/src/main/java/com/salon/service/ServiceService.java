package com.salon.service;

import com.salon.model.Category;
import com.salon.model.Hairdresser;
import com.salon.model.ServicePrice;
import com.salon.repository.CategoryRepository;
import com.salon.repository.HairdresserRepository;
import com.salon.repository.ServicePriceRepository;
import com.salon.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ServiceService {
    
    @Autowired
    private ServiceRepository serviceRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private HairdresserRepository hairdresserRepository;
    
    @Autowired
    private ServicePriceRepository servicePriceRepository;
    
    public List<com.salon.model.Service> getAllServices() {
        return serviceRepository.findAll();
    }
    
    public Optional<com.salon.model.Service> getServiceById(Long id) {
        return serviceRepository.findById(id);
    }
    
    public List<com.salon.model.Service> getServicesByCategory(Long categoryId) {
        return serviceRepository.findByCategoryId(categoryId);
    }
    
    public List<com.salon.model.Service> searchServices(String searchTerm) {
        return serviceRepository.findByNameContainingIgnoreCase(searchTerm);
    }
    
    public com.salon.model.Service createService(com.salon.model.Service service) {
        return serviceRepository.save(service);
    }
    
    public com.salon.model.Service updateService(Long id, com.salon.model.Service serviceDetails) {
        com.salon.model.Service service = serviceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Service not found"));
        service.setName(serviceDetails.getName());
        service.setDescription(serviceDetails.getDescription());
        service.setDurationMinutes(serviceDetails.getDurationMinutes());
        if (serviceDetails.getCategory() != null) {
            service.setCategory(serviceDetails.getCategory());
        }
        return serviceRepository.save(service);
    }
    
    public void deleteService(Long id) {
        serviceRepository.deleteById(id);
    }
    
    public ServicePrice setServicePrice(Long serviceId, Long hairdresserId, BigDecimal price) {
        com.salon.model.Service service = serviceRepository.findById(serviceId)
            .orElseThrow(() -> new RuntimeException("Service not found"));
        
        Hairdresser hairdresser = null;
        if (hairdresserId != null) {
            hairdresser = hairdresserRepository.findById(hairdresserId)
                .orElseThrow(() -> new RuntimeException("Hairdresser not found"));
        }
        
        Optional<ServicePrice> existing = servicePriceRepository
            .findByServiceAndHairdresser(service, hairdresser);
        
        ServicePrice servicePrice;
        if (existing.isPresent()) {
            servicePrice = existing.get();
            servicePrice.setPrice(price);
        } else {
            servicePrice = new ServicePrice();
            servicePrice.setService(service);
            servicePrice.setHairdresser(hairdresser);
            servicePrice.setPrice(price);
        }
        return servicePriceRepository.save(servicePrice);
    }
}
