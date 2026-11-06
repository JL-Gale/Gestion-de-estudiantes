package com.example.backendColegio.dto.admin;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrearCursoRequest {

    @NotNull(message = "El grado es obligatorio")
    @Min(value = 1, message = "El grado mínimo es 1")
    @Max(value = 11, message = "El grado máximo es 11")
    private Integer grado;

    @NotBlank(message = "El grupo es obligatorio")
    private String grupo;

    @NotNull(message = "El año lectivo es obligatorio")
    @Min(value = 2000, message = "El año lectivo debe ser válido")
    @JsonAlias({"anio_lectivo", "anioLectivo", "añoLectivo"})
    private Integer anioLectivo;
}

