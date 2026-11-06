package com.example.backendColegio.dto.estudiante;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstudianteBoletinResponse {
    private Long idEstudiante;
    private String nombreEstudiante;
    private String numeroDocumento;
    private String curso;
    private List<MateriaNotaDTO> materias;
}

