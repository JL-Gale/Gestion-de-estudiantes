package com.example.backendColegio.dto.admin;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CursoResponse {
    private Long idCurso;
    private Integer grado;
    private String grupo;
    private Integer anioLectivo;
    private String nombreCompleto; // Ej: "10° A (2026)"
}

