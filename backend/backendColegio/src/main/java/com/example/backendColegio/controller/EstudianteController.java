package com.example.backendColegio.controller;

import com.example.backendColegio.config.CustomUserPrincipal;
import com.example.backendColegio.dto.estudiante.EstudianteBoletinResponse;
import com.example.backendColegio.dto.estudiante.MiCursoResponse;
import com.example.backendColegio.service.EstudianteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/estudiante")
@RequiredArgsConstructor
@Tag(name = "4. Panel del Estudiante", description = "Endpoints para la consulta de información académica del alumno: mi curso y reporte de notas (Exclusivo rol ESTUDIANTE)")
@SecurityRequirement(name = "BearerAuth")
public class EstudianteController {

    private final EstudianteService estudianteService;

    @GetMapping("/mi-curso")
    @Operation(summary = "Obtener mi curso", description = "Consulta la tabla matricula para mostrar en qué curso (grado, grupo y año lectivo) está inscrito el estudiante.")
    public ResponseEntity<MiCursoResponse> obtenerMiCurso(
            @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        return ResponseEntity.ok(estudianteService.obtenerMiCurso(principal.getIdUsuario()));
    }

    @GetMapping("/mis-notas")
    @Operation(summary = "Obtener mis notas completas del año actual", description = "Cruza calificacion, corte_evaluacion, carga_academica y asignatura para entregar el reporte completo de notas con promedio ponderado acumulado del año lectivo vigente.")
    public ResponseEntity<EstudianteBoletinResponse> obtenerMisNotas(
            @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        return ResponseEntity.ok(estudianteService.obtenerMisNotas(principal.getIdUsuario()));
    }

    @GetMapping("/historial/mis-notas/{anio}")
    @Operation(summary = "Historial de mis notas por año", description = "Genera el reporte de notas del estudiante cruzando los datos exclusivamente con la matrícula y cargas académicas del año solicitado.")
    public ResponseEntity<EstudianteBoletinResponse> obtenerMisNotasHistorial(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Integer anio
    ) {
        return ResponseEntity.ok(estudianteService.obtenerMisNotasHistorial(principal.getIdUsuario(), anio));
    }
}
