package com.example.backendColegio.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "curso", uniqueConstraints = {
        @UniqueConstraint(name = "uq_grado_grupo_anio", columnNames = {"grado", "grupo", "anio_lectivo"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_curso")
    private Long idCurso;

    @Column(name = "grado", nullable = false)
    private Integer grado;

    @Column(name = "grupo", nullable = false, length = 2)
    private String grupo;

    @Column(name = "anio_lectivo", nullable = false)
    private Integer anioLectivo;
}

