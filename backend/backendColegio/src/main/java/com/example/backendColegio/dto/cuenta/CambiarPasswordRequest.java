package com.example.backendColegio.dto.cuenta;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CambiarPasswordRequest {

    @NotBlank(message = "La contraseña actual es requerida")
    @JsonAlias({"contrasena_actual", "contrasenaActual", "passwordActual"})
    private String contrasenaActual;

    @NotBlank(message = "La nueva contraseña es requerida")
    @Size(min = 6, message = "La nueva contraseña debe tener al menos 6 caracteres")
    @JsonAlias({"nueva_contrasena", "nuevaContrasena", "nuevoPassword"})
    private String nuevaContrasena;
}

