package com.example.backendColegio.dto.estudiante;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleCorteNotaResponse {
    private Long idCorte;
    private String nombreCorte;
    private Integer porcentaje;
    private Long idCalificacion;
    private BigDecimal nota;
    private String observaciones;
    private LocalDateTime fechaRegistro;
}

