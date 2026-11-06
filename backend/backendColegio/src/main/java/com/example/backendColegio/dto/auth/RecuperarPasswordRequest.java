package com.example.backendColegio.dto.auth;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecuperarPasswordRequest {

    @NotBlank(message = "El correo institucional es obligatorio")
    @Email(message = "El formato del correo es inválido")
    @JsonAlias({"correo_institucional", "email"})
    private String correoInstitucional;

    @NotBlank(message = "El número de documento es obligatorio")
    @JsonAlias({"numero_documento", "documento"})
    private String numeroDocumento;

    @NotNull(message = "La fecha de nacimiento es obligatoria")
    @JsonAlias({"fecha_nacimiento"})
    private LocalDate fechaNacimiento;
}
