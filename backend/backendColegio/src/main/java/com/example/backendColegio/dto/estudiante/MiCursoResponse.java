package com.example.backendColegio.dto.estudiante;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MiCursoResponse {
    private Long idCurso;
    private Integer grado;
    private String grupo;
    private Integer anioLectivo;
    private String nombreCompleto; // Ej: "10° A (2026)"
    private LocalDateTime fechaMatricula;
}

