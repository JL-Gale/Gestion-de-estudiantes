package com.example.backendColegio.dto.docente;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstudianteCursoResponse {
    private Long idEstudiante;
    private String numeroDocumento;
    private String nombres;
    private String apellidos;
    private String telefono;
}

