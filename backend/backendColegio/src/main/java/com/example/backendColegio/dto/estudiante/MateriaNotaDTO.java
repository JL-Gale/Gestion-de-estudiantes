package com.example.backendColegio.dto.estudiante;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MateriaNotaDTO {
    private Long idCarga;
    private Long idAsignatura;
    private String nombreAsignatura;
    private String nombreDocente;
    private List<DetalleCorteNotaDTO> cortes;
    private BigDecimal promedioPonderadoAcumulado;
    private BigDecimal porcentajeEvaluado;
}

