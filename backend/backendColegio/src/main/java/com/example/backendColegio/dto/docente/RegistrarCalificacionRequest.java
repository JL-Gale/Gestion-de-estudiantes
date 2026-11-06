package com.example.backendColegio.dto.docente;

import com.fasterxml.jackson.annotation.JsonAlias;
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
public class RegistrarCalificacionRequest {

    @NotNull(message = "El id del estudiante es obligatorio")
    @JsonAlias({"id_estudiante", "idEstudiante"})
    private Long idEstudiante;

    @NotNull(message = "El id del corte es obligatorio")
    @JsonAlias({"id_corte", "idCorte"})
    private Long idCorte;

    @NotNull(message = "La nota es obligatoria")
    @DecimalMin(value = "0.0", message = "La nota mínima permitida es 0.0")
    @DecimalMax(value = "5.0", message = "La nota máxima permitida es 5.0")
    private BigDecimal nota;

    private String observaciones;
}

