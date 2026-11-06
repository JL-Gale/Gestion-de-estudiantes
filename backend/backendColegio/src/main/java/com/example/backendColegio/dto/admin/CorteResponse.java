package com.example.backendColegio.dto.admin;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CorteResponse {
    private Long idCorte;
    private Long idCarga;
    private String nombre;
    private BigDecimal porcentaje;
    private java.time.LocalDate fechaInicioCalificacion;
    private java.time.LocalDate fechaFinCalificacion;
}

