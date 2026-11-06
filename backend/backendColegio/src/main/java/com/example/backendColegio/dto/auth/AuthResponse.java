package com.example.backendColegio.dto.auth;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    @Builder.Default
    private String tipo = "Bearer";
    private Long idUsuario;
    private String correoInstitucional;
    private String rol;
}
