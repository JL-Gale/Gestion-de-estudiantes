package com.example.backendColegio.service;

import com.example.backendColegio.dto.estudiante.*;
import com.example.backendColegio.exception.ResourceNotFoundException;
import com.example.backendColegio.model.*;
import com.example.backendColegio.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Year;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EstudianteService {

    private final EstudianteRepository estudianteRepository;
    private final MatriculaRepository matriculaRepository;
    private final CargaAcademicaRepository cargaAcademicaRepository;
    private final CorteEvaluacionRepository corteEvaluacionRepository;
    private final CalificacionRepository calificacionRepository;

    @Transactional(readOnly = true)
    public MiCursoResponse obtenerMiCurso(Long userId) {
        Estudiante estudiante = obtenerEstudiantePorUsuario(userId);
        int anioActual = Year.now().getValue();

        Matricula matricula = matriculaRepository.findByEstudiante_IdEstudianteAndCurso_AnioLectivo(estudiante.getIdEstudiante(), anioActual)
                .orElseThrow(() -> new ResourceNotFoundException("El estudiante no se encuentra matriculado en ningún curso para el año lectivo " + anioActual));

        Curso curso = matricula.getCurso();
        return MiCursoResponse.builder()
                .idCurso(curso.getIdCurso())
                .grado(curso.getGrado())
                .grupo(curso.getGrupo())
                .anioLectivo(curso.getAnioLectivo())
                .nombreCompleto(curso.getGrado() + "° " + curso.getGrupo() + " (" + curso.getAnioLectivo() + ")")
                .fechaMatricula(matricula.getFechaMatricula())
                .build();
    }

    @Transactional(readOnly = true)
    public EstudianteBoletinResponse obtenerMisNotas(Long userId) {
        return obtenerNotasPorAnio(userId, Year.now().getValue());
    }

    @Transactional(readOnly = true)
    public EstudianteBoletinResponse obtenerMisNotasHistorial(Long userId, Integer anio) {
        return obtenerNotasPorAnio(userId, anio);
    }

    private EstudianteBoletinResponse obtenerNotasPorAnio(Long userId, Integer anio) {
        Estudiante estudiante = obtenerEstudiantePorUsuario(userId);

        Matricula matricula = matriculaRepository.findByEstudiante_IdEstudianteAndCurso_AnioLectivo(estudiante.getIdEstudiante(), anio)
                .orElseThrow(() -> new ResourceNotFoundException("El estudiante no cuenta con matrícula para el año lectivo " + anio));

        Curso curso = matricula.getCurso();
        List<CargaAcademica> cargas = cargaAcademicaRepository.findByCurso_IdCurso(curso.getIdCurso());

        List<Calificacion> calificaciones = calificacionRepository.findByEstudiante_IdEstudiante(estudiante.getIdEstudiante());
        Map<Long, Calificacion> calificacionPorCorte = calificaciones.stream()
                .collect(Collectors.toMap(c -> c.getCorte().getIdCorte(), Function.identity(), (c1, c2) -> c1));

        List<MateriaNotaDTO> materiasDTO = new ArrayList<>();

        for (CargaAcademica carga : cargas) {
            List<CorteEvaluacion> cortes = corteEvaluacionRepository.findByCargaAcademica_IdCarga(carga.getIdCarga());

            List<DetalleCorteNotaDTO> detallesCortes = new ArrayList<>();
            BigDecimal acumuladoPonderado = BigDecimal.ZERO;
            BigDecimal porcentajeEvaluado = BigDecimal.ZERO;

            for (CorteEvaluacion corte : cortes) {
                Calificacion cal = calificacionPorCorte.get(corte.getIdCorte());

                DetalleCorteNotaDTO.DetalleCorteNotaDTOBuilder corteBuilder = DetalleCorteNotaDTO.builder()
                        .idCorte(corte.getIdCorte())
                        .nombreCorte(corte.getNombre())
                        .porcentaje(corte.getPorcentaje())
                        .fechaInicioCalificacion(corte.getFechaInicioCalificacion())
                        .fechaFinCalificacion(corte.getFechaFinCalificacion());

                if (cal != null) {
                    corteBuilder.idCalificacion(cal.getIdCalificacion())
                            .nota(cal.getNota())
                            .observaciones(cal.getObservaciones());

                    // aporte = (nota * porcentaje) / 100
                    BigDecimal factor = corte.getPorcentaje().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
                    BigDecimal aporte = cal.getNota().multiply(factor);
                    acumuladoPonderado = acumuladoPonderado.add(aporte);

                    porcentajeEvaluado = porcentajeEvaluado.add(corte.getPorcentaje());
                }

                detallesCortes.add(corteBuilder.build());
            }

            materiasDTO.add(MateriaNotaDTO.builder()
                    .idCarga(carga.getIdCarga())
                    .idAsignatura(carga.getAsignatura().getIdAsignatura())
                    .nombreAsignatura(carga.getAsignatura().getNombre())
                    .nombreDocente(carga.getDocente().getNombres() + " " + carga.getDocente().getApellidos())
                    .cortes(detallesCortes)
                    .promedioPonderadoAcumulado(acumuladoPonderado.setScale(2, RoundingMode.HALF_UP))
                    .porcentajeEvaluado(porcentajeEvaluado.setScale(2, RoundingMode.HALF_UP))
                    .build());
        }

        return EstudianteBoletinResponse.builder()
                .idEstudiante(estudiante.getIdEstudiante())
                .nombreEstudiante(estudiante.getNombres() + " " + estudiante.getApellidos())
                .numeroDocumento(estudiante.getNumeroDocumento())
                .curso(curso.getGrado() + "° " + curso.getGrupo() + " (" + curso.getAnioLectivo() + ")")
                .materias(materiasDTO)
                .build();
    }

    private Estudiante obtenerEstudiantePorUsuario(Long userId) {
        return estudianteRepository.findByUsuario_IdUsuario(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de estudiante no encontrado para el usuario actual"));
    }
}
