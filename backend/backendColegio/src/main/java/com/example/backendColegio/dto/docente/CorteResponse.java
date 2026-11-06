package com.example.backendColegio.dto.docente;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CorteResponse {
    private Long idCorte;
    private Long idAsignatura;
    private String nombre;
    private Integer porcentaje;
}

