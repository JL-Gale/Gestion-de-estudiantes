package com.example.backendColegio.controller;

import com.example.backendColegio.config.CustomUserPrincipal;
import com.example.backendColegio.dto.admin.CorteResponse;
import com.example.backendColegio.dto.docente.*;
import com.example.backendColegio.service.DocenteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/docente")
@RequiredArgsConstructor
@Tag(name = "3. Panel del Docente", description = "Endpoints para la gestión docente: mis cargas, alumnos por curso, cortes y calificaciones (Exclusivo rol DOCENTE)")
@SecurityRequirement(name = "BearerAuth")
public class DocenteController {

    private final DocenteService docenteService;

    @GetMapping("/mis-cargas")
    @Operation(summary = "Obtener mis cargas académicas", description = "Retorna los registros de carga_academica vinculados al docente logueado para el año actual (materias y salones que dicta).")
    public ResponseEntity<List<DocenteCargaResponse>> obtenerMisCargas(
            @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        return ResponseEntity.ok(docenteService.obtenerMisCargas(principal.getIdUsuario()));
    }

    @GetMapping("/historial/mis-cargas/{anio}")
    @Operation(summary = "Historial de mis cargas académicas por año", description = "Permite al profesor ver qué materias dictó y en qué salones durante un año anterior.")
    public ResponseEntity<List<DocenteCargaResponse>> obtenerMisCargasHistorial(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Integer anio
    ) {
        return ResponseEntity.ok(docenteService.obtenerMisCargasHistorial(principal.getIdUsuario(), anio));
    }

    @GetMapping("/cargas/{idCarga}/estudiantes")
    @Operation(summary = "Obtener estudiantes de la carga", description = "Busca el curso asociado a la carga y retorna los estudiantes matriculados en ese salón.")
    public ResponseEntity<List<EstudianteCursoResponse>> obtenerEstudiantesDeCarga(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long idCarga
    ) {
        return ResponseEntity.ok(docenteService.obtenerEstudiantesDeCarga(principal.getIdUsuario(), idCarga));
    }

    @GetMapping("/cargas/{idCarga}/cortes")
    @Operation(summary = "Obtener cortes de la carga", description = "Retorna los periodos de evaluación configurados para esa materia y curso específico para armar la tabla de notas.")
    public ResponseEntity<List<CorteResponse>> obtenerCortesDeCarga(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long idCarga
    ) {
        return ResponseEntity.ok(docenteService.obtenerCortesDeCarga(principal.getIdUsuario(), idCarga));
    }

    @GetMapping("/cargas/{idCarga}/calificaciones")
    @Operation(summary = "Obtener calificaciones de la carga", description = "Retorna las notas previamente registradas de los estudiantes para los cortes de esta carga académica.")
    public ResponseEntity<List<CalificacionResponse>> obtenerCalificacionesDeCarga(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long idCarga
    ) {
        return ResponseEntity.ok(docenteService.obtenerCalificacionesDeCarga(principal.getIdUsuario(), idCarga));
    }

    @PostMapping("/calificaciones")
    @Operation(summary = "Registrar o actualizar calificación", description = "Recibe id_estudiante, id_corte, nota (0.0 a 5.0) y observaciones. Inserta o actualiza la calificación.")
    public ResponseEntity<CalificacionResponse> guardarCalificacion(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody RegistrarCalificacionRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(docenteService.guardarCalificacion(principal.getIdUsuario(), request));
    }
}
