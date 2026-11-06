package com.example.backendColegio.dto.docente;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalificacionResponse {
    private Long idCalificacion;
    private Long idEstudiante;
    private String nombreEstudiante;
    private Long idCorte;
    private String nombreCorte;
    private BigDecimal porcentajeCorte;
    private BigDecimal nota;
    private String observaciones;
}
