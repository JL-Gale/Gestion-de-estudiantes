package com.example.backendColegio.dto.admin;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrearCargaAcademicaRequest {

    @NotNull(message = "El id del curso es obligatorio")
    @JsonAlias({"id_curso", "idCurso"})
    private Long idCurso;

    @NotNull(message = "El id de la asignatura es obligatorio")
    @JsonAlias({"id_asignatura", "idAsignatura"})
    private Long idAsignatura;

    @NotNull(message = "El id del docente es obligatorio")
    @JsonAlias({"id_docente", "idDocente"})
    private Long idDocente;
}

