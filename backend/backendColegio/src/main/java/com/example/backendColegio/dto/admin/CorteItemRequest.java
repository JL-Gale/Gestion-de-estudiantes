package com.example.backendColegio.dto.admin;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CorteItemRequest {

    @NotBlank(message = "El nombre del corte es obligatorio")
    private String nombre;

    @NotNull(message = "El porcentaje es obligatorio")
    @DecimalMin(value = "0.01", message = "El porcentaje debe ser mayor a 0")
    @DecimalMax(value = "100.00", message = "El porcentaje no puede ser mayor a 100")
    private BigDecimal porcentaje;

    @JsonAlias({"fecha_inicio_calificacion", "fechaInicioCalificacion"})
    private LocalDate fechaInicioCalificacion;

    @JsonAlias({"fecha_fin_calificacion", "fechaFinCalificacion"})
    private LocalDate fechaFinCalificacion;
}
