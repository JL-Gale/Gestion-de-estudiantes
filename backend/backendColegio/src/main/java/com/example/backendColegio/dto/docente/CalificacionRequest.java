package com.example.backendColegio.dto.docente;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalificacionRequest {

    @NotNull(message = "El id_corte es obligatorio")
    private Long idCorte;

    @NotNull(message = "La nota es obligatoria")
    @DecimalMin(value = "0.0", message = "La nota mínima permitida es 0.0")
    @DecimalMax(value = "5.0", message = "La nota máxima permitida es 5.0")
    private BigDecimal nota;

    private String observaciones;
}

