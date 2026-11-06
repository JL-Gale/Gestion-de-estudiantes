package com.example.backendColegio.controller;

import com.example.backendColegio.dto.admin.*;
import com.example.backendColegio.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "2. Panel de Administración", description = "Endpoints de administración escolar: gestión de usuarios, asignaturas, cursos, cargas académicas y matrículas (Exclusivo rol ADMIN)")
@SecurityRequirement(name = "BearerAuth")
public class AdminController {

    private final AdminService adminService;

    // ==========================================
    // GESTIÓN DE USUARIOS: ESTUDIANTES
    // ==========================================

    @PostMapping("/estudiantes")
    @Operation(summary = "Crear estudiante", description = "Crea un estudiante y su usuario asociado. Autogenera el correo_institucional y establece el numero_documento como contraseña inicial.")
    public ResponseEntity<EstudianteResponse> crearEstudiante(@Valid @RequestBody CrearEstudianteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.crearEstudiante(request));
    }

    @GetMapping("/estudiantes")
    @Operation(
            summary = "Listar o buscar estudiantes",
            description = "Devuelve los estudiantes registrados. Si se especifica 'search' o 'q', busca por nombres, apellidos, documento o correo con paginación/límite (por defecto 20)."
    )
    public ResponseEntity<List<EstudianteResponse>> listarEstudiantes(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "20") Integer limit
    ) {
        String criterio = (search != null && !search.isBlank()) ? search : q;
        if (criterio != null && !criterio.isBlank()) {
            int maxResults = (limit != null && limit > 0) ? Math.min(limit, 100) : 20;
            return ResponseEntity.ok(adminService.buscarEstudiantes(criterio.trim(), PageRequest.of(0, maxResults)));
        }
        return ResponseEntity.ok(adminService.listarEstudiantes());
    }

    @GetMapping("/estudiantes/buscar")
    @Operation(
            summary = "Buscar estudiantes para autocompletado",
            description = "Endpoint específico para autocompletar estudiantes en formularios (ej. matrícula) buscando por nombres, apellidos o número de documento."
    )
    public ResponseEntity<List<EstudianteResponse>> buscarEstudiantes(
            @RequestParam(required = false, defaultValue = "") String q,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "20") Integer limit
    ) {
        String criterio = (q != null && !q.isBlank()) ? q : search;
        int maxResults = (limit != null && limit > 0) ? Math.min(limit, 100) : 20;
        return ResponseEntity.ok(adminService.buscarEstudiantes(criterio != null ? criterio.trim() : "", PageRequest.of(0, maxResults)));
    }

    @GetMapping("/estudiantes/{id}")
    @Operation(summary = "Obtener estudiante por ID", description = "Devuelve la información detallada de un estudiante específico.")
    public ResponseEntity<EstudianteResponse> obtenerEstudiante(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.obtenerEstudiante(id));
    }

    @PutMapping("/estudiantes/{id}")
    @Operation(summary = "Actualizar estudiante", description = "Permite editar datos del estudiante (nombres, apellidos, fecha_nacimiento, teléfono).")
    public ResponseEntity<EstudianteResponse> actualizarEstudiante(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarEstudianteRequest request
    ) {
        return ResponseEntity.ok(adminService.actualizarEstudiante(id, request));
    }

    @DeleteMapping("/estudiantes/{id}")
    @Operation(summary = "Eliminar estudiante", description = "Elimina o inactiva el registro de un estudiante.")
    public ResponseEntity<Map<String, String>> eliminarEstudiante(@PathVariable Long id) {
        adminService.eliminarEstudiante(id);
        return ResponseEntity.ok(Map.of("message", "Estudiante eliminado correctamente."));
    }

    // ==========================================
    // GESTIÓN DE USUARIOS: DOCENTES
    // ==========================================

    @PostMapping("/docentes")
    @Operation(summary = "Crear docente", description = "Crea un docente y su usuario con rol DOCENTE. Autogenera el correo_institucional y usa el numero_documento como contraseña inicial.")
    public ResponseEntity<DocenteResponse> crearDocente(@Valid @RequestBody CrearDocenteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.crearDocente(request));
    }

    @GetMapping("/docentes")
    @Operation(summary = "Listar docentes", description = "Devuelve la lista de todos los docentes registrados.")
    public ResponseEntity<List<DocenteResponse>> listarDocentes() {
        return ResponseEntity.ok(adminService.listarDocentes());
    }

    @GetMapping("/docentes/{id}")
    @Operation(summary = "Obtener docente por ID", description = "Devuelve la información de un docente específico.")
    public ResponseEntity<DocenteResponse> obtenerDocente(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.obtenerDocente(id));
    }

    @PutMapping("/docentes/{id}")
    @Operation(summary = "Actualizar docente", description = "Permite modificar datos personales de un docente.")
    public ResponseEntity<DocenteResponse> actualizarDocente(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarDocenteRequest request
    ) {
        return ResponseEntity.ok(adminService.actualizarDocente(id, request));
    }

    @DeleteMapping("/docentes/{id}")
    @Operation(summary = "Eliminar docente", description = "Elimina a un docente. Valida que no tenga cargas académicas asignadas.")
    public ResponseEntity<Map<String, String>> eliminarDocente(@PathVariable Long id) {
        adminService.eliminarDocente(id);
        return ResponseEntity.ok(Map.of("message", "Docente eliminado correctamente."));
    }

    // ==========================================
    // GESTIÓN ACADÉMICA BASE: ASIGNATURAS
    // ==========================================

    @PostMapping("/asignaturas")
    @Operation(summary = "Crear asignatura", description = "Crea una materia en el catálogo base de asignaturas.")
    public ResponseEntity<AsignaturaResponse> crearAsignatura(@Valid @RequestBody CrearAsignaturaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.crearAsignatura(request));
    }

    @GetMapping("/asignaturas")
    @Operation(summary = "Listar asignaturas", description = "Devuelve el catálogo de asignaturas disponibles.")
    public ResponseEntity<List<AsignaturaResponse>> listarAsignaturas() {
        return ResponseEntity.ok(adminService.listarAsignaturas());
    }

    @GetMapping("/asignaturas/{id}")
    @Operation(summary = "Obtener asignatura", description = "Detalle de una asignatura.")
    public ResponseEntity<AsignaturaResponse> obtenerAsignatura(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.obtenerAsignatura(id));
    }

    @PutMapping("/asignaturas/{id}")
    @Operation(summary = "Actualizar asignatura", description = "Modifica el nombre de una asignatura.")
    public ResponseEntity<AsignaturaResponse> actualizarAsignatura(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarAsignaturaRequest request
    ) {
        return ResponseEntity.ok(adminService.actualizarAsignatura(id, request));
    }

    @DeleteMapping("/asignaturas/{id}")
    @Operation(summary = "Eliminar asignatura", description = "Elimina una asignatura del catálogo si no está asignada a cargas académicas.")
    public ResponseEntity<Map<String, String>> eliminarAsignatura(@PathVariable Long id) {
        adminService.eliminarAsignatura(id);
        return ResponseEntity.ok(Map.of("message", "Asignatura eliminada correctamente."));
    }

    // ==========================================
    // GESTIÓN ACADÉMICA BASE: CURSOS
    // ==========================================

    @PostMapping("/cursos")
    @Operation(summary = "Crear curso", description = "Crea un salón en la tabla curso (grado del 1 al 11, grupo 'A', 'B' y año lectivo).")
    public ResponseEntity<CursoResponse> crearCurso(@Valid @RequestBody CrearCursoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.crearCurso(request));
    }

    @GetMapping("/cursos")
    @Operation(summary = "Listar cursos del año actual", description = "Devuelve la lista de cursos registrados para el año lectivo vigente.")
    public ResponseEntity<List<CursoResponse>> listarCursos() {
        return ResponseEntity.ok(adminService.listarCursos());
    }

    @GetMapping("/historial/cursos/{anio}")
    @Operation(summary = "Historial de cursos por año", description = "Retorna los cursos (grados y grupos) que existieron en el año especificado.")
    public ResponseEntity<List<CursoResponse>> listarCursosHistorial(@PathVariable Integer anio) {
        return ResponseEntity.ok(adminService.listarCursosHistorial(anio));
    }

    @GetMapping("/cursos/{id}")
    @Operation(summary = "Obtener curso", description = "Detalle de un curso.")
    public ResponseEntity<CursoResponse> obtenerCurso(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.obtenerCurso(id));
    }

    @PutMapping("/cursos/{id}")
    @Operation(summary = "Actualizar curso", description = "Modifica los datos de un curso.")
    public ResponseEntity<CursoResponse> actualizarCurso(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarCursoRequest request
    ) {
        return ResponseEntity.ok(adminService.actualizarCurso(id, request));
    }

    @DeleteMapping("/cursos/{id}")
    @Operation(summary = "Eliminar curso", description = "Elimina un curso si no contiene cargas ni alumnos matriculados.")
    public ResponseEntity<Map<String, String>> eliminarCurso(@PathVariable Long id) {
        adminService.eliminarCurso(id);
        return ResponseEntity.ok(Map.of("message", "Curso eliminado correctamente."));
    }

    // ==========================================
    // CARGA ACADÉMICA Y CORTES
    // ==========================================

    @PostMapping("/cargas-academicas")
    @Operation(summary = "Crear carga académica", description = "Asigna un docente a una asignatura dentro de un curso (ej: Profe Carlos -> Matemáticas en 10° A).")
    public ResponseEntity<CargaAcademicaResponse> crearCargaAcademica(@Valid @RequestBody CrearCargaAcademicaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.crearCargaAcademica(request));
    }

    @GetMapping("/cargas-academicas")
    @Operation(summary = "Listar cargas académicas", description = "Devuelve la lista de cargas académicas configuradas con su curso, materia y profesor.")
    public ResponseEntity<List<CargaAcademicaResponse>> listarCargasAcademicas() {
        return ResponseEntity.ok(adminService.listarCargasAcademicas());
    }

    @GetMapping("/historial/cargas-academicas/{anio}")
    @Operation(summary = "Consultar historial de cargas académicas por año", description = "Retorna las cargas académicas registradas en un año lectivo específico.")
    public ResponseEntity<List<CargaAcademicaResponse>> listarHistorialCargas(@PathVariable Integer anio) {
        return ResponseEntity.ok(adminService.listarHistorialCargas(anio));
    }

    @DeleteMapping("/cargas-academicas/{id}")
    @Operation(summary = "Eliminar carga académica", description = "Elimina una carga académica y sus cortes/notas asociados en cascada.")
    public ResponseEntity<Map<String, String>> eliminarCargaAcademica(@PathVariable Long id) {
        adminService.eliminarCargaAcademica(id);
        return ResponseEntity.ok(Map.of("message", "Carga académica eliminada correctamente."));
    }

    @PostMapping("/cargas-academicas/{idCarga}/cortes")
    @Operation(summary = "Configurar cortes de evaluación", description = "Configura los periodos de evaluación para una materia específica de un salón. Valida que los porcentajes sumen exactamente 100%.")
    public ResponseEntity<List<CorteResponse>> configurarCortes(
            @PathVariable Long idCarga,
            @Valid @RequestBody List<CorteItemRequest> cortes
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.configurarCortes(idCarga, cortes));
    }

    @GetMapping("/cargas-academicas/{idCarga}/cortes")
    @Operation(summary = "Listar cortes de una carga académica", description = "Devuelve los cortes de evaluación configurados para esa carga.")
    public ResponseEntity<List<CorteResponse>> listarCortesDeCarga(@PathVariable Long idCarga) {
        return ResponseEntity.ok(adminService.listarCortesDeCarga(idCarga));
    }

    // ==========================================
    // MATRÍCULAS
    // ==========================================

    @PostMapping("/matriculas")
    @Operation(summary = "Matricular estudiante en curso", description = "Inscribe a un estudiante en un curso completo (salón) en la tabla matricula.")
    public ResponseEntity<MatriculaResponse> crearMatricula(@Valid @RequestBody CrearMatriculaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.crearMatricula(request));
    }

    @GetMapping("/matriculas")
    @Operation(summary = "Listar matrículas", description = "Devuelve todas las matrículas registradas.")
    public ResponseEntity<List<MatriculaResponse>> listarMatriculas() {
        return ResponseEntity.ok(adminService.listarMatriculas());
    }

    @GetMapping("/historial/matriculas/{anio}")
    @Operation(summary = "Historial de matrículas por año", description = "Retorna el listado de todos los estudiantes matriculados en un año específico.")
    public ResponseEntity<List<MatriculaResponse>> listarMatriculasHistorial(@PathVariable Integer anio) {
        return ResponseEntity.ok(adminService.listarMatriculasHistorial(anio));
    }

    @DeleteMapping("/matriculas/{id}")
    @Operation(summary = "Eliminar matrícula", description = "Elimina la matrícula de un estudiante en un curso.")
    public ResponseEntity<Map<String, String>> eliminarMatricula(@PathVariable Long id) {
        adminService.eliminarMatricula(id);
        return ResponseEntity.ok(Map.of("message", "Matrícula eliminada correctamente."));
    }
}
