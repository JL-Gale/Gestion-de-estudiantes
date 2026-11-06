package com.example.backendColegio.dto.docente;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstudianteInscritoResponse {
    private Long idInscripcion;
    private Long idEstudiante;
    private String codigoMatricula;
    private String nombre;
    private String apellido;
    private String correoInstitucional;
    private String periodoAcademico;
}

