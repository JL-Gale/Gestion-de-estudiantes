package com.example.backendColegio.service;

import com.example.backendColegio.dto.admin.CorteResponse;
import com.example.backendColegio.dto.docente.*;
import com.example.backendColegio.exception.BusinessLogicException;
import com.example.backendColegio.exception.ResourceNotFoundException;
import com.example.backendColegio.model.*;
import com.example.backendColegio.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocenteService {

    private final DocenteRepository docenteRepository;
    private final CargaAcademicaRepository cargaAcademicaRepository;
    private final MatriculaRepository matriculaRepository;
    private final CorteEvaluacionRepository corteEvaluacionRepository;
    private final CalificacionRepository calificacionRepository;
    private final EstudianteRepository estudianteRepository;

    @Transactional(readOnly = true)
    public List<DocenteCargaResponse> obtenerMisCargas(Long userId) {
        Docente docente = obtenerDocentePorUsuario(userId);
        int anioActual = Year.now().getValue();
        return cargaAcademicaRepository.findByDocente_IdDocenteAndCurso_AnioLectivo(docente.getIdDocente(), anioActual).stream()
                .map(ca -> DocenteCargaResponse.builder()
                        .idCarga(ca.getIdCarga())
                        .idCurso(ca.getCurso().getIdCurso())
                        .curso(ca.getCurso().getGrado() + "° " + ca.getCurso().getGrupo() + " (" + ca.getCurso().getAnioLectivo() + ")")
                        .idAsignatura(ca.getAsignatura().getIdAsignatura())
                        .asignatura(ca.getAsignatura().getNombre())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DocenteCargaResponse> obtenerMisCargasHistorial(Long userId, Integer anio) {
        Docente docente = obtenerDocentePorUsuario(userId);
        return cargaAcademicaRepository.findByDocente_IdDocenteAndCurso_AnioLectivo(docente.getIdDocente(), anio).stream()
                .map(ca -> DocenteCargaResponse.builder()
                        .idCarga(ca.getIdCarga())
                        .idCurso(ca.getCurso().getIdCurso())
                        .curso(ca.getCurso().getGrado() + "° " + ca.getCurso().getGrupo() + " (" + ca.getCurso().getAnioLectivo() + ")")
                        .idAsignatura(ca.getAsignatura().getIdAsignatura())
                        .asignatura(ca.getAsignatura().getNombre())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EstudianteCursoResponse> obtenerEstudiantesDeCarga(Long userId, Long idCarga) {
        Docente docente = obtenerDocentePorUsuario(userId);
        CargaAcademica carga = cargaAcademicaRepository.findById(idCarga)
                .orElseThrow(() -> new ResourceNotFoundException("Carga académica no encontrada con ID: " + idCarga));

        validarDocenteTitular(docente, carga);

        return matriculaRepository.findByCurso_IdCurso(carga.getCurso().getIdCurso()).stream()
                .map(m -> {
                    Estudiante e = m.getEstudiante();
                    return EstudianteCursoResponse.builder()
                            .idEstudiante(e.getIdEstudiante())
                            .numeroDocumento(e.getNumeroDocumento())
                            .nombres(e.getNombres())
                            .apellidos(e.getApellidos())
                            .telefono(e.getTelefono())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CorteResponse> obtenerCortesDeCarga(Long userId, Long idCarga) {
        Docente docente = obtenerDocentePorUsuario(userId);
        CargaAcademica carga = cargaAcademicaRepository.findById(idCarga)
                .orElseThrow(() -> new ResourceNotFoundException("Carga académica no encontrada con ID: " + idCarga));

        validarDocenteTitular(docente, carga);

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

    @Transactional(readOnly = true)
    public List<CalificacionResponse> obtenerCalificacionesDeCarga(Long userId, Long idCarga) {
        Docente docente = obtenerDocentePorUsuario(userId);
        CargaAcademica carga = cargaAcademicaRepository.findById(idCarga)
                .orElseThrow(() -> new ResourceNotFoundException("Carga académica no encontrada con ID: " + idCarga));

        validarDocenteTitular(docente, carga);

        return calificacionRepository.findByCorte_CargaAcademica_IdCarga(idCarga).stream()
                .map(c -> CalificacionResponse.builder()
                        .idCalificacion(c.getIdCalificacion())
                        .idEstudiante(c.getEstudiante().getIdEstudiante())
                        .nombreEstudiante(c.getEstudiante().getNombres() + " " + c.getEstudiante().getApellidos())
                        .idCorte(c.getCorte().getIdCorte())
                        .nombreCorte(c.getCorte().getNombre())
                        .porcentajeCorte(c.getCorte().getPorcentaje())
                        .nota(c.getNota())
                        .observaciones(c.getObservaciones())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public CalificacionResponse guardarCalificacion(Long userId, RegistrarCalificacionRequest request) {
        Docente docente = obtenerDocentePorUsuario(userId);

        CorteEvaluacion corte = corteEvaluacionRepository.findById(request.getIdCorte())
                .orElseThrow(() -> new ResourceNotFoundException("Corte de evaluación no encontrado con ID: " + request.getIdCorte()));

        CargaAcademica carga = corte.getCargaAcademica();
        validarDocenteTitular(docente, carga);

        LocalDate hoy = LocalDate.now();
        if (corte.getFechaInicioCalificacion() != null && corte.getFechaFinCalificacion() != null) {
            if (hoy.isBefore(corte.getFechaInicioCalificacion()) || hoy.isAfter(corte.getFechaFinCalificacion())) {
                throw new BusinessLogicException(String.format(
                        "El sistema de notas se encuentra cerrado para este periodo (%s). Fechas habilitadas: %s a %s.",
                        corte.getNombre(),
                        corte.getFechaInicioCalificacion(),
                        corte.getFechaFinCalificacion()
                ));
            }
        } else {
            throw new BusinessLogicException(String.format(
                    "El periodo (%s) aún no tiene habilitadas las fechas de calificación.",
                    corte.getNombre()
            ));
        }

        Estudiante estudiante = estudianteRepository.findById(request.getIdEstudiante())
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado con ID: " + request.getIdEstudiante()));

        boolean matriculadoEnCurso = matriculaRepository.existsByEstudiante_IdEstudianteAndCurso_IdCurso(
                estudiante.getIdEstudiante(), carga.getCurso().getIdCurso());

        if (!matriculadoEnCurso) {
            throw new BusinessLogicException("El estudiante no se encuentra matriculado en el curso correspondiente a esta carga académica.");
        }

        // Upsert: si ya existe calificación para (id_estudiante, id_corte) se actualiza, si no se crea
        Optional<Calificacion> calificacionOpt = calificacionRepository.findByEstudiante_IdEstudianteAndCorte_IdCorte(
                estudiante.getIdEstudiante(), corte.getIdCorte());

        Calificacion calificacion;
        if (calificacionOpt.isPresent()) {
            calificacion = calificacionOpt.get();
            calificacion.setNota(request.getNota());
            calificacion.setObservaciones(request.getObservaciones());
        } else {
            calificacion = Calificacion.builder()
                    .estudiante(estudiante)
                    .corte(corte)
                    .nota(request.getNota())
                    .observaciones(request.getObservaciones())
                    .build();
        }

        Calificacion guardada = calificacionRepository.save(calificacion);

        return CalificacionResponse.builder()
                .idCalificacion(guardada.getIdCalificacion())
                .idEstudiante(estudiante.getIdEstudiante())
                .nombreEstudiante(estudiante.getNombres() + " " + estudiante.getApellidos())
                .idCorte(corte.getIdCorte())
                .nombreCorte(corte.getNombre())
                .porcentajeCorte(corte.getPorcentaje())
                .nota(guardada.getNota())
                .observaciones(guardada.getObservaciones())
                .build();
    }

    private Docente obtenerDocentePorUsuario(Long userId) {
        return docenteRepository.findByUsuario_IdUsuario(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de docente no encontrado para el usuario actual"));
    }

    private void validarDocenteTitular(Docente docente, CargaAcademica carga) {
        if (!carga.getDocente().getIdDocente().equals(docente.getIdDocente())) {
            throw new AccessDeniedException("No tiene permisos para gestionar una carga académica que no le ha sido asignada.");
        }
    }
}
