package com.example.backendColegio.dto.admin;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrearMatriculaRequest {

    @NotNull(message = "El id del estudiante es obligatorio")
    @JsonAlias({"id_estudiante", "idEstudiante"})
    private Long idEstudiante;

    @NotNull(message = "El id del curso es obligatorio")
    @JsonAlias({"id_curso", "idCurso"})
    private Long idCurso;
}

