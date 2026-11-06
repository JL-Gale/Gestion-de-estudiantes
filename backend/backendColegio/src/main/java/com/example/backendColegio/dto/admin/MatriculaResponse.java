package com.example.backendColegio.dto.admin;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatriculaResponse {
    private Long idMatricula;
    private Long idEstudiante;
    private String nombreEstudiante;
    private String numeroDocumento;
    private Long idCurso;
    private String curso; // Ej: "10° A (2026)"
    private LocalDateTime fechaMatricula;
}

