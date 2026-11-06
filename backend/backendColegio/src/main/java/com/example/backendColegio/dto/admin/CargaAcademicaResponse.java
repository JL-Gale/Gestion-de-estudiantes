package com.example.backendColegio.dto.admin;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CargaAcademicaResponse {
    private Long idCarga;
    private Long idCurso;
    private String curso; // Ej: "10° A (2026)"
    private Long idAsignatura;
    private String asignatura;
    private Long idDocente;
    private String docente;
}

