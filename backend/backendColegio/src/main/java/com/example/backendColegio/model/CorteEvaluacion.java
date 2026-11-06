package com.example.backendColegio.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "corte_evaluacion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CorteEvaluacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_corte")
    private Long idCorte;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_carga", nullable = false)
    private CargaAcademica cargaAcademica;

    @Column(name = "nombre", nullable = false, length = 50)
    private String nombre;

    @Column(name = "porcentaje", nullable = false, precision = 5, scale = 2)
    private BigDecimal porcentaje;

    @Column(name = "fecha_inicio_calificacion")
    private java.time.LocalDate fechaInicioCalificacion;

    @Column(name = "fecha_fin_calificacion")
    private java.time.LocalDate fechaFinCalificacion;
}
