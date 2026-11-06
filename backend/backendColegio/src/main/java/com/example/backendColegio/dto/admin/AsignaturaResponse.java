package com.example.backendColegio.dto.admin;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AsignaturaResponse {
    private Long idAsignatura;
    private String nombre;
}
