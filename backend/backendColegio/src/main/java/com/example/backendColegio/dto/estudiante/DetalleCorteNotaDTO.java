package com.example.backendColegio.dto.estudiante;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleCorteNotaDTO {
    private Long idCorte;
    private String nombreCorte;
    private BigDecimal porcentaje;
    private Long idCalificacion;
    private BigDecimal nota;
    private String observaciones;
    private java.time.LocalDate fechaInicioCalificacion;
    private java.time.LocalDate fechaFinCalificacion;
}

