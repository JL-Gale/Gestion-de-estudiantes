package com.example.backendColegio.dto.auth;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {

    @NotBlank(message = "El correo institucional es obligatorio")
    @Email(message = "El formato del correo es inválido")
    @JsonAlias({"correo_institucional", "email"})
    private String correoInstitucional;

    @NotBlank(message = "La contraseña es obligatoria")
    @JsonAlias({"contrasena", "clave"})
    private String password;
}
