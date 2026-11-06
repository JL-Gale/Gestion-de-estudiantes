package com.example.backendColegio.service;

import com.example.backendColegio.dto.admin.*;
import com.example.backendColegio.exception.BusinessLogicException;
import com.example.backendColegio.exception.ResourceNotFoundException;
import com.example.backendColegio.model.*;
import com.example.backendColegio.repository.*;
import com.example.backendColegio.util.EmailGeneratorUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UsuarioRepository usuarioRepository;
    private final EstudianteRepository estudianteRepository;
    private final DocenteRepository docenteRepository;
    private final CursoRepository cursoRepository;
    private final AsignaturaRepository asignaturaRepository;
    private final CargaAcademicaRepository cargaAcademicaRepository;
    private final MatriculaRepository matriculaRepository;
    private final CorteEvaluacionRepository corteEvaluacionRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailGeneratorUtil emailGeneratorUtil;

    // ==========================================
    // 1. GESTIÓN DE ESTUDIANTES
    // ==========================================

    @Transactional
    public EstudianteResponse crearEstudiante(CrearEstudianteRequest request) {
        String doc = request.getNumeroDocumento().trim();

        if (estudianteRepository.existsByNumeroDocumento(doc)) {
            throw new DataIntegrityViolationException("Ya existe un estudiante registrado con el documento: " + doc);
        }

        String correoInstitucional = emailGeneratorUtil.generarCorreoInstitucional(request.getNombres(), request.getApellidos());

        Usuario usuario = Usuario.builder()
                .correoInstitucional(correoInstitucional)
                .password(passwordEncoder.encode(doc))
                .rol(Rol.ESTUDIANTE.name())
                .estado(true)
                .build();
        Usuario usuarioGuardado = usuarioRepository.save(usuario);

        Estudiante estudiante = Estudiante.builder()
                .numeroDocumento(doc)
                .nombres(request.getNombres().trim())
                .apellidos(request.getApellidos().trim())
                .fechaNacimiento(request.getFechaNacimiento())
                .telefono(request.getTelefono())
                .usuario(usuarioGuardado)
                .build();
        Estudiante estudianteGuardado = estudianteRepository.save(estudiante);

        return mapearEstudiante(estudianteGuardado);
    }

    @Transactional(readOnly = true)
    public List<EstudianteResponse> listarEstudiantes() {
        return estudianteRepository.findAll().stream()
                .map(this::mapearEstudiante)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EstudianteResponse> buscarEstudiantes(String criterio, Pageable pageable) {
        if (criterio == null || criterio.isBlank()) {
            return estudianteRepository.findAll(pageable).stream()
                    .map(this::mapearEstudiante)
                    .collect(Collectors.toList());
        }
        return estudianteRepository.buscarEstudiantes(criterio.trim(), pageable).stream()
                .map(this::mapearEstudiante)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EstudianteResponse obtenerEstudiante(Long id) {
        Estudiante estudiante = estudianteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado con ID: " + id));
        return mapearEstudiante(estudiante);
    }

    @Transactional
    public EstudianteResponse actualizarEstudiante(Long id, ActualizarEstudianteRequest request) {
        Estudiante estudiante = estudianteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado con ID: " + id));

        estudiante.setNombres(request.getNombres().trim());
        estudiante.setApellidos(request.getApellidos().trim());
        estudiante.setFechaNacimiento(request.getFechaNacimiento());
        estudiante.setTelefono(request.getTelefono());

        return mapearEstudiante(estudianteRepository.save(estudiante));
    }

    @Transactional
    public void eliminarEstudiante(Long id) {
        Estudiante estudiante = estudianteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado con ID: " + id));

        if (estudiante.getUsuario() != null) {
            estudiante.getUsuario().setEstado(false);
            usuarioRepository.save(estudiante.getUsuario());
        }
        estudianteRepository.delete(estudiante);
    }

    // ==========================================
    // 2. GESTIÓN DE DOCENTES
    // ==========================================

    @Transactional
    public DocenteResponse crearDocente(CrearDocenteRequest request) {
        String doc = request.getNumeroDocumento().trim();

        if (docenteRepository.existsByNumeroDocumento(doc)) {
            throw new DataIntegrityViolationException("Ya existe un docente registrado con el documento: " + doc);
        }

        String correoInstitucional = emailGeneratorUtil.generarCorreoInstitucional(request.getNombres(), request.getApellidos());

        Usuario usuario = Usuario.builder()
                .correoInstitucional(correoInstitucional)
                .password(passwordEncoder.encode(doc))
                .rol(Rol.DOCENTE.name())
                .estado(true)
                .build();
        Usuario usuarioGuardado = usuarioRepository.save(usuario);

        Docente docente = Docente.builder()
                .numeroDocumento(doc)
                .nombres(request.getNombres().trim())
                .apellidos(request.getApellidos().trim())
                .fechaNacimiento(request.getFechaNacimiento())
                .telefono(request.getTelefono())
                .usuario(usuarioGuardado)
                .build();
        Docente docenteGuardado = docenteRepository.save(docente);

        return mapearDocente(docenteGuardado);
    }

    @Transactional(readOnly = true)
    public List<DocenteResponse> listarDocentes() {
        return docenteRepository.findAll().stream()
                .map(this::mapearDocente)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DocenteResponse obtenerDocente(Long id) {
        Docente docente = docenteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Docente no encontrado con ID: " + id));
        return mapearDocente(docente);
    }

    @Transactional
    public DocenteResponse actualizarDocente(Long id, ActualizarDocenteRequest request) {
        Docente docente = docenteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Docente no encontrado con ID: " + id));

        docente.setNombres(request.getNombres().trim());
        docente.setApellidos(request.getApellidos().trim());
        docente.setFechaNacimiento(request.getFechaNacimiento());
        docente.setTelefono(request.getTelefono());

        return mapearDocente(docenteRepository.save(docente));
    }

    @Transactional
    public void eliminarDocente(Long id) {
        Docente docente = docenteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Docente no encontrado con ID: " + id));

        if (cargaAcademicaRepository.existsByDocente_IdDocente(id)) {
            throw new BusinessLogicException("No se puede eliminar un docente que tiene cargas académicas asignadas.");
        }

        if (docente.getUsuario() != null) {
            docente.getUsuario().setEstado(false);
            usuarioRepository.save(docente.getUsuario());
        }
        docenteRepository.delete(docente);
    }

    // ==========================================
    // 3. GESTIÓN DE ASIGNATURAS
    // ==========================================

    @Transactional
    public AsignaturaResponse crearAsignatura(CrearAsignaturaRequest request) {
        Asignatura asignatura = Asignatura.builder()
                .nombre(request.getNombre().trim())
                .build();
        return mapearAsignatura(asignaturaRepository.save(asignatura));
    }

    @Transactional(readOnly = true)
    public List<AsignaturaResponse> listarAsignaturas() {
        return asignaturaRepository.findAll().stream()
                .map(this::mapearAsignatura)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AsignaturaResponse obtenerAsignatura(Long id) {
        Asignatura asignatura = asignaturaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asignatura no encontrada con ID: " + id));
        return mapearAsignatura(asignatura);
    }

    @Transactional
    public AsignaturaResponse actualizarAsignatura(Long id, ActualizarAsignaturaRequest request) {
        Asignatura asignatura = asignaturaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asignatura no encontrada con ID: " + id));
        asignatura.setNombre(request.getNombre().trim());
        return mapearAsignatura(asignaturaRepository.save(asignatura));
    }

    @Transactional
    public void eliminarAsignatura(Long id) {
        Asignatura asignatura = asignaturaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asignatura no encontrada con ID: " + id));

        if (cargaAcademicaRepository.existsByAsignatura_IdAsignatura(id)) {
            throw new BusinessLogicException("No se puede eliminar la asignatura porque pertenece a cargas académicas activas.");
        }
        asignaturaRepository.delete(asignatura);
    }

    // ==========================================
    // 4. GESTIÓN DE CURSOS
    // ==========================================

    @Transactional
    public CursoResponse crearCurso(CrearCursoRequest request) {
        String grupo = request.getGrupo().trim().toUpperCase();

        if (cursoRepository.existsByGradoAndGrupoAndAnioLectivo(request.getGrado(), grupo, request.getAnioLectivo())) {
            throw new DataIntegrityViolationException(
                    String.format("Ya existe el curso grado %d grupo %s para el año %d", request.getGrado(), grupo, request.getAnioLectivo()));
        }

        Curso curso = Curso.builder()
                .grado(request.getGrado())
                .grupo(grupo)
                .anioLectivo(request.getAnioLectivo())
                .build();
        return mapearCurso(cursoRepository.save(curso));
    }

    @Transactional(readOnly = true)
    public List<CursoResponse> listarCursos() {
        int anioActual = Year.now().getValue();
        return cursoRepository.findByAnioLectivo(anioActual).stream()
                .map(this::mapearCurso)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CursoResponse> listarCursosHistorial(Integer anio) {
        return cursoRepository.findByAnioLectivo(anio).stream()
                .map(this::mapearCurso)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CursoResponse obtenerCurso(Long id) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con ID: " + id));
        return mapearCurso(curso);
    }

    @Transactional
    public CursoResponse actualizarCurso(Long id, ActualizarCursoRequest request) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con ID: " + id));

        int anioActual = java.time.Year.now().getValue();
        if (curso.getAnioLectivo() < anioActual) {
            throw new BusinessLogicException("No se pueden modificar cursos de años lectivos anteriores (" + curso.getAnioLectivo() + ").");
        }

        String grupo = request.getGrupo().trim().toUpperCase();
        curso.setGrado(request.getGrado());
        curso.setGrupo(grupo);
        curso.setAnioLectivo(request.getAnioLectivo());

        return mapearCurso(cursoRepository.save(curso));
    }

    @Transactional
    public void eliminarCurso(Long id) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con ID: " + id));

        if (cargaAcademicaRepository.existsByCurso_IdCurso(id) || matriculaRepository.existsByCurso_IdCurso(id)) {
            throw new BusinessLogicException("No se puede eliminar el curso porque tiene matrículas o cargas académicas asociadas.");
        }
        cursoRepository.delete(curso);
    }

    // ==========================================
    // 5. GESTIÓN DE CARGA ACADÉMICA
    // ==========================================

    @Transactional
    public CargaAcademicaResponse crearCargaAcademica(CrearCargaAcademicaRequest request) {
        Curso curso = cursoRepository.findById(request.getIdCurso())
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con ID: " + request.getIdCurso()));

        Asignatura asignatura = asignaturaRepository.findById(request.getIdAsignatura())
                .orElseThrow(() -> new ResourceNotFoundException("Asignatura no encontrada con ID: " + request.getIdAsignatura()));

        Docente docente = docenteRepository.findById(request.getIdDocente())
                .orElseThrow(() -> new ResourceNotFoundException("Docente no encontrado con ID: " + request.getIdDocente()));

        if (cargaAcademicaRepository.existsByCurso_IdCursoAndAsignatura_IdAsignatura(curso.getIdCurso(), asignatura.getIdAsignatura())) {
            throw new BusinessLogicException("Este curso ya tiene asignada la materia " + asignatura.getNombre());
        }

        CargaAcademica carga = CargaAcademica.builder()
                .curso(curso)
                .asignatura(asignatura)
                .docente(docente)
                .build();

        return mapearCarga(cargaAcademicaRepository.save(carga));
    }

    @Transactional(readOnly = true)
    public List<CargaAcademicaResponse> listarCargasAcademicas() {
        int anioActual = java.time.Year.now().getValue();
        return cargaAcademicaRepository.findByCurso_AnioLectivo(anioActual).stream()
                .map(this::mapearCarga)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CargaAcademicaResponse> listarHistorialCargas(Integer anio) {
        return cargaAcademicaRepository.findByCurso_AnioLectivo(anio).stream()
                .map(this::mapearCarga)
                .collect(Collectors.toList());
    }

    @Transactional
    public void eliminarCargaAcademica(Long id) {
        CargaAcademica carga = cargaAcademicaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Carga académica no encontrada con ID: " + id));
        cargaAcademicaRepository.delete(carga);
    }

    // ==========================================
    // 6. CORTES DE EVALUACIÓN DE LA CARGA
    // ==========================================

    @Transactional
    public List<CorteResponse> configurarCortes(Long idCarga, List<CorteItemRequest> cortesRequest) {
        CargaAcademica carga = cargaAcademicaRepository.findById(idCarga)
                .orElseThrow(() -> new ResourceNotFoundException("Carga académica no encontrada con ID: " + idCarga));

        int anioActual = java.time.Year.now().getValue();
        if (carga.getCurso() != null && carga.getCurso().getAnioLectivo() != null && carga.getCurso().getAnioLectivo() < anioActual) {
            throw new BusinessLogicException("No se pueden configurar cortes evaluativos para cargas de años anteriores (" + carga.getCurso().getAnioLectivo() + ").");
        }

        if (cortesRequest == null || cortesRequest.isEmpty()) {
            throw new BusinessLogicException("Debe proporcionar al menos un corte de evaluación.");
        }

        BigDecimal suma = cortesRequest.stream()
                .map(CorteItemRequest::getPorcentaje)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (suma.compareTo(new BigDecimal("100.00")) != 0 && suma.compareTo(new BigDecimal("100")) != 0) {
            throw new BusinessLogicException("La suma de los porcentajes de los cortes debe ser exactamente 100%. Suma actual: " + suma + "%");
        }

        for (CorteItemRequest item : cortesRequest) {
            if (item.getFechaInicioCalificacion() != null && item.getFechaFinCalificacion() != null) {
                if (item.getFechaFinCalificacion().isBefore(item.getFechaInicioCalificacion())) {
                    throw new BusinessLogicException("La fecha de fin de calificación no puede ser anterior a la fecha de inicio en el corte: " + item.getNombre());
                }
            } else if (item.getFechaInicioCalificacion() != null || item.getFechaFinCalificacion() != null) {
                throw new BusinessLogicException("Debe ingresar tanto la fecha de inicio como la de fin para el corte: " + item.getNombre() + ", o dejar ambas en blanco.");
            }
        }

        corteEvaluacionRepository.deleteByCargaAcademica_IdCarga(idCarga);

        List<CorteResponse> responses = new ArrayList<>();
        for (CorteItemRequest item : cortesRequest) {
            CorteEvaluacion corte = CorteEvaluacion.builder()
                    .cargaAcademica(carga)
                    .nombre(item.getNombre().trim())
                    .porcentaje(item.getPorcentaje())
                    .fechaInicioCalificacion(item.getFechaInicioCalificacion())
                    .fechaFinCalificacion(item.getFechaFinCalificacion())
                    .build();
            CorteEvaluacion guardado = corteEvaluacionRepository.save(corte);
            responses.add(CorteResponse.builder()
                    .idCorte(guardado.getIdCorte())
                    .idCarga(idCarga)
                    .nombre(guardado.getNombre())
                    .porcentaje(guardado.getPorcentaje())
                    .fechaInicioCalificacion(guardado.getFechaInicioCalificacion())
                    .fechaFinCalificacion(guardado.getFechaFinCalificacion())
                    .build());
        }

        return responses;
    }

    @Transactional(readOnly = true)
    public List<CorteResponse> listarCortesDeCarga(Long idCarga) {
        if (!cargaAcademicaRepository.existsById(idCarga)) {
            throw new ResourceNotFoundException("Carga académica no encontrada con ID: " + idCarga);
        }

        return corteEvaluacionRepository.findByCargaAcademica_IdCarga(idCarga).stream()
                .map(c -> CorteResponse.builder()
                        .idCorte(c.getIdCorte())
                        .idCarga(idCarga)
                        .nombre(c.getNombre())
                        .porcentaje(c.getPorcentaje())
                        .fechaInicioCalificacion(c.getFechaInicioCalificacion())
                        .fechaFinCalificacion(c.getFechaFinCalificacion())
                        .build())
                .collect(Collectors.toList());
    }

    // ==========================================
    // 7. GESTIÓN DE MATRÍCULAS
    // ==========================================

    @Transactional
    public MatriculaResponse crearMatricula(CrearMatriculaRequest request) {
        Estudiante estudiante = estudianteRepository.findById(request.getIdEstudiante())
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado con ID: " + request.getIdEstudiante()));

        Curso curso = cursoRepository.findById(request.getIdCurso())
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con ID: " + request.getIdCurso()));

        int anioActual = Year.now().getValue();
        if (curso.getAnioLectivo() < anioActual || curso.getAnioLectivo() > anioActual + 1) {
            throw new BusinessLogicException("No se puede matricular en el periodo " + curso.getAnioLectivo() +
                    ". Solo se permite el año actual (" + anioActual + ") o el próximo (" + (anioActual + 1) + ").");
        }

        if (matriculaRepository.existsByEstudiante_IdEstudianteAndCurso_IdCurso(estudiante.getIdEstudiante(), curso.getIdCurso())) {
            throw new BusinessLogicException("El estudiante ya se encuentra matriculado en este curso.");
        }

        Matricula matricula = Matricula.builder()
                .estudiante(estudiante)
                .curso(curso)
                .fechaMatricula(LocalDateTime.now())
                .build();

        return mapearMatricula(matriculaRepository.save(matricula));
    }

    @Transactional(readOnly = true)
    public List<MatriculaResponse> listarMatriculas() {
        return matriculaRepository.findAll().stream()
                .map(this::mapearMatricula)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MatriculaResponse> listarMatriculasHistorial(Integer anio) {
        return matriculaRepository.findByCurso_AnioLectivo(anio).stream()
                .map(this::mapearMatricula)
                .collect(Collectors.toList());
    }

    @Transactional
    public void eliminarMatricula(Long id) {
        Matricula matricula = matriculaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula no encontrada con ID: " + id));
        matriculaRepository.delete(matricula);
    }

    // ==========================================
    // MAPEOS AUXILIARES
    // ==========================================

    private EstudianteResponse mapearEstudiante(Estudiante e) {
        return EstudianteResponse.builder()
                .idEstudiante(e.getIdEstudiante())
                .numeroDocumento(e.getNumeroDocumento())
                .nombres(e.getNombres())
                .apellidos(e.getApellidos())
                .fechaNacimiento(e.getFechaNacimiento())
                .telefono(e.getTelefono())
                .correoInstitucional(e.getUsuario() != null ? e.getUsuario().getCorreoInstitucional() : null)
                .idUsuario(e.getUsuario() != null ? e.getUsuario().getIdUsuario() : null)
                .build();
    }

    private DocenteResponse mapearDocente(Docente d) {
        return DocenteResponse.builder()
                .idDocente(d.getIdDocente())
                .numeroDocumento(d.getNumeroDocumento())
                .nombres(d.getNombres())
                .apellidos(d.getApellidos())
                .fechaNacimiento(d.getFechaNacimiento())
                .telefono(d.getTelefono())
                .correoInstitucional(d.getUsuario() != null ? d.getUsuario().getCorreoInstitucional() : null)
                .idUsuario(d.getUsuario() != null ? d.getUsuario().getIdUsuario() : null)
                .build();
    }

    private AsignaturaResponse mapearAsignatura(Asignatura a) {
        return AsignaturaResponse.builder()
                .idAsignatura(a.getIdAsignatura())
                .nombre(a.getNombre())
                .build();
    }

    private CursoResponse mapearCurso(Curso c) {
        return CursoResponse.builder()
                .idCurso(c.getIdCurso())
                .grado(c.getGrado())
                .grupo(c.getGrupo())
                .anioLectivo(c.getAnioLectivo())
                .nombreCompleto(c.getGrado() + "° " + c.getGrupo() + " (" + c.getAnioLectivo() + ")")
                .build();
    }

    private CargaAcademicaResponse mapearCarga(CargaAcademica ca) {
        return CargaAcademicaResponse.builder()
                .idCarga(ca.getIdCarga())
                .idCurso(ca.getCurso().getIdCurso())
                .curso(ca.getCurso().getGrado() + "° " + ca.getCurso().getGrupo() + " (" + ca.getCurso().getAnioLectivo() + ")")
                .idAsignatura(ca.getAsignatura().getIdAsignatura())
                .asignatura(ca.getAsignatura().getNombre())
                .idDocente(ca.getDocente().getIdDocente())
                .docente(ca.getDocente().getNombres() + " " + ca.getDocente().getApellidos())
                .build();
    }

    private MatriculaResponse mapearMatricula(Matricula m) {
        return MatriculaResponse.builder()
                .idMatricula(m.getIdMatricula())
                .idEstudiante(m.getEstudiante().getIdEstudiante())
                .nombreEstudiante(m.getEstudiante().getNombres() + " " + m.getEstudiante().getApellidos())
                .numeroDocumento(m.getEstudiante().getNumeroDocumento())
                .idCurso(m.getCurso().getIdCurso())
                .curso(m.getCurso().getGrado() + "° " + m.getCurso().getGrupo() + " (" + m.getCurso().getAnioLectivo() + ")")
                .fechaMatricula(m.getFechaMatricula())
                .build();
    }
}
