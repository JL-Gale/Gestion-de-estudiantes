package com.example.backendColegio.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActualizarAsignaturaRequest {

    @NotBlank(message = "El nombre de la asignatura es obligatorio")
    private String nombre;
}
