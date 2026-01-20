package com.salon.controller;

import com.salon.model.Hairdresser;
import com.salon.repository.HairdresserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hairdressers")
@CrossOrigin(origins = "*")
public class HairdresserController {
    
    @Autowired
    private HairdresserRepository hairdresserRepository;
    
    @GetMapping
    public ResponseEntity<List<Hairdresser>> getAllHairdressers() {
        List<Hairdresser> hairdressers = hairdresserRepository.findByIsActiveTrue();
        return ResponseEntity.ok(hairdressers);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Hairdresser> getHairdresser(@PathVariable Long id) {
        return hairdresserRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.<Hairdresser>status(org.springframework.http.HttpStatus.NOT_FOUND).build());
    }
}
