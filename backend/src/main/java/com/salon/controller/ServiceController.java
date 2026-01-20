package com.salon.controller;

import com.salon.dto.ServiceDTO;
import com.salon.model.Category;
import com.salon.model.Service;
import com.salon.model.ServicePrice;
import com.salon.repository.CategoryRepository;
import com.salon.repository.ServicePriceRepository;
import com.salon.service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "*")
public class ServiceController {
    
    @Autowired
    private ServiceService serviceService;
    
    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ServicePriceRepository servicePriceRepository;
    
    @GetMapping
    public ResponseEntity<List<ServiceDTO>> getAllServices(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search) {
        List<Service> services;
        
        if (categoryId != null) {
            services = serviceService.getServicesByCategory(categoryId);
        } else if (search != null && !search.isEmpty()) {
            services = serviceService.searchServices(search);
        } else {
            services = serviceService.getAllServices();
        }
        
        List<ServiceDTO> dtos = services.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ServiceDTO> getService(@PathVariable Long id) {
        return serviceService.getServiceById(id)
            .map(service -> ResponseEntity.ok(convertToDTO(service)))
            .orElseGet(() -> ResponseEntity.<ServiceDTO>status(HttpStatus.NOT_FOUND).build());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createService(@RequestBody Map<String, Object> request) {
        try {
            Service service = new Service();
            service.setName((String) request.get("name"));
            service.setDescription((String) request.get("description"));
            if (request.get("durationMinutes") != null) {
                service.setDurationMinutes(((Number) request.get("durationMinutes")).intValue());
            }
            
            Long categoryId = Long.valueOf(request.get("categoryId").toString());
            Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
            service.setCategory(category);
            
            Service created = serviceService.createService(service);
            if (request.get("price") != null) {
                BigDecimal price = new BigDecimal(request.get("price").toString());
                serviceService.setServicePrice(created.getId(), null, price);
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(created));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateService(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            Service service = serviceService.getServiceById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
            
            if (request.get("name") != null) {
                service.setName((String) request.get("name"));
            }
            if (request.get("description") != null) {
                service.setDescription((String) request.get("description"));
            }
            if (request.get("durationMinutes") != null) {
                service.setDurationMinutes(((Number) request.get("durationMinutes")).intValue());
            }
            if (request.get("categoryId") != null) {
                Long categoryId = Long.valueOf(request.get("categoryId").toString());
                Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found"));
                service.setCategory(category);
            }
            
            Service updated = serviceService.updateService(id, service);
            if (request.get("price") != null) {
                BigDecimal price = new BigDecimal(request.get("price").toString());
                serviceService.setServicePrice(id, null, price);
            }
            return ResponseEntity.ok(convertToDTO(updated));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteService(@PathVariable Long id) {
        try {
            serviceService.deleteService(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @PostMapping("/{id}/price")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> setPrice(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            Long hairdresserId = request.get("hairdresserId") != null ? 
                Long.valueOf(request.get("hairdresserId").toString()) : null;
            BigDecimal price = new BigDecimal(request.get("price").toString());
            
            serviceService.setServicePrice(id, hairdresserId, price);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    private ServiceDTO convertToDTO(Service service) {
        ServiceDTO dto = new ServiceDTO();
        dto.setId(service.getId());
        dto.setName(service.getName());
        dto.setDescription(service.getDescription());
        dto.setDurationMinutes(service.getDurationMinutes());
        if (service.getCategory() != null) {
            dto.setCategoryId(service.getCategory().getId());
            dto.setCategoryName(service.getCategory().getName());
        }
        Optional<ServicePrice> price = servicePriceRepository.findByServiceAndHairdresserIsNull(service);
        if (price.isEmpty()) {
            price = servicePriceRepository.findByService(service).stream()
                .min((a, b) -> a.getPrice().compareTo(b.getPrice()));
        }
        price.ifPresent(p -> dto.setPrice(p.getPrice()));
        return dto;
    }
}
