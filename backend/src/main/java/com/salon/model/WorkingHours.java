package com.salon.model;

import lombok.Data;
import javax.persistence.*;
import java.sql.Time;

@Entity
@Table(name = "working_hours", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"hairdresser_id", "day_of_week"})
})
@Data
public class WorkingHours {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hairdresser_id", nullable = false)
    private Hairdresser hairdresser;

    @Column(name = "day_of_week", nullable = false)
    private Integer dayOfWeek;

    @Column(name = "start_time", nullable = false)
    private Time startTime;

    @Column(name = "end_time", nullable = false)
    private Time endTime;

    @Column(name = "is_available")
    private Boolean isAvailable = true;
}
