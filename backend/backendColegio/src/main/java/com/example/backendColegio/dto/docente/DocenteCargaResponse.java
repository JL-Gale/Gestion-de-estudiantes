package com.example.backendColegio.dto.docente;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocenteCargaResponse {
    private Long idCarga;
    private Long idCurso;
    private String curso; // Ej: "10° A (2026)"
    private Long idAsignatura;
    private String asignatura;
}

