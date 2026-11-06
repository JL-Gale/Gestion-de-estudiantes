package com.example.backendColegio.service;

import com.example.backendColegio.dto.estudiante.EstudianteBoletinResponse;
import com.example.backendColegio.dto.estudiante.MateriaNotaDTO;
import com.example.backendColegio.model.*;
import com.example.backendColegio.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EstudianteServiceUnitTest {

    @Mock
    private EstudianteRepository estudianteRepository;
    @Mock
    private MatriculaRepository matriculaRepository;
    @Mock
    private CargaAcademicaRepository cargaAcademicaRepository;
    @Mock
    private CorteEvaluacionRepository corteEvaluacionRepository;
    @Mock
    private CalificacionRepository calificacionRepository;

    @InjectMocks
    private EstudianteService estudianteService;

    @Test
    @DisplayName("Debe calcular correctamente el promedio ponderado y avance porcentual")
    void obtenerMisNotas_CalculoPromedioPonderado() {
        Long userId = 10L;
        Estudiante estudiante = Estudiante.builder().idEstudiante(1L).nombres("Ana").apellidos("Gómez").numeroDocumento("102030").build();
        when(estudianteRepository.findByUsuario_IdUsuario(userId)).thenReturn(Optional.of(estudiante));

        Curso curso = Curso.builder().idCurso(5L).grado(10).grupo("A").anioLectivo(2026).build();
        Matricula matricula = Matricula.builder().idMatricula(1L).estudiante(estudiante).curso(curso).build();
        when(matriculaRepository.findByEstudiante_IdEstudianteAndCurso_AnioLectivo(1L, 2026)).thenReturn(Optional.of(matricula));

        Docente docente = Docente.builder().idDocente(2L).nombres("Carlos").apellidos("Pérez").build();
        Asignatura asignatura = Asignatura.builder().idAsignatura(100L).nombre("Física").build();
        CargaAcademica carga = CargaAcademica.builder().idCarga(20L).curso(curso).asignatura(asignatura).docente(docente).build();
        when(cargaAcademicaRepository.findByCurso_IdCurso(5L)).thenReturn(List.of(carga));

        CorteEvaluacion c1 = CorteEvaluacion.builder().idCorte(1L).cargaAcademica(carga).nombre("Periodo 1").porcentaje(new BigDecimal("40.00")).build();
        CorteEvaluacion c2 = CorteEvaluacion.builder().idCorte(2L).cargaAcademica(carga).nombre("Periodo 2").porcentaje(new BigDecimal("60.00")).build();
        when(corteEvaluacionRepository.findByCargaAcademica_IdCarga(20L)).thenReturn(List.of(c1, c2));

        // Solo calificado Periodo 1 con nota 4.5
        Calificacion cal1 = Calificacion.builder()
                .idCalificacion(1L)
                .estudiante(estudiante)
                .corte(c1)
                .nota(new BigDecimal("4.50"))
                .build();
        when(calificacionRepository.findByEstudiante_IdEstudiante(1L)).thenReturn(List.of(cal1));

        EstudianteBoletinResponse boletin = estudianteService.obtenerMisNotas(userId);

        assertNotNull(boletin);
        assertEquals(1, boletin.getMaterias().size());
        MateriaNotaDTO materia = boletin.getMaterias().get(0);

        // Aporte de 4.50 * 40% = 1.80
        assertEquals(new BigDecimal("1.80"), materia.getPromedioPonderadoAcumulado());
        assertEquals(new BigDecimal("40.00"), materia.getPorcentajeEvaluado());
    }

    @Test
    @DisplayName("Debe consultar correctamente el historial de notas de un año anterior")
    void obtenerMisNotasHistorial_ConsultaAnioAnterior() {
        Long userId = 10L;
        Integer anioHistorial = 2024;
        Estudiante estudiante = Estudiante.builder().idEstudiante(1L).nombres("Ana").apellidos("Gómez").numeroDocumento("102030").build();
        when(estudianteRepository.findByUsuario_IdUsuario(userId)).thenReturn(Optional.of(estudiante));

        Curso curso2024 = Curso.builder().idCurso(3L).grado(8).grupo("B").anioLectivo(anioHistorial).build();
        Matricula matricula2024 = Matricula.builder().idMatricula(10L).estudiante(estudiante).curso(curso2024).build();
        when(matriculaRepository.findByEstudiante_IdEstudianteAndCurso_AnioLectivo(1L, anioHistorial)).thenReturn(Optional.of(matricula2024));

        Docente docente = Docente.builder().idDocente(2L).nombres("Carlos").apellidos("Pérez").build();
        Asignatura asignatura = Asignatura.builder().idAsignatura(101L).nombre("Biología").build();
        CargaAcademica carga = CargaAcademica.builder().idCarga(30L).curso(curso2024).asignatura(asignatura).docente(docente).build();
        when(cargaAcademicaRepository.findByCurso_IdCurso(3L)).thenReturn(List.of(carga));

        CorteEvaluacion c1 = CorteEvaluacion.builder().idCorte(10L).cargaAcademica(carga).nombre("Periodo Único").porcentaje(new BigDecimal("100.00")).build();
        when(corteEvaluacionRepository.findByCargaAcademica_IdCarga(30L)).thenReturn(List.of(c1));

        Calificacion cal = Calificacion.builder()
                .idCalificacion(5L)
                .estudiante(estudiante)
                .corte(c1)
                .nota(new BigDecimal("4.00"))
                .build();
        when(calificacionRepository.findByEstudiante_IdEstudiante(1L)).thenReturn(List.of(cal));

        EstudianteBoletinResponse boletin = estudianteService.obtenerMisNotasHistorial(userId, anioHistorial);

        assertNotNull(boletin);
        assertEquals("8° B (2024)", boletin.getCurso());
        assertEquals(1, boletin.getMaterias().size());
        assertEquals(new BigDecimal("4.00"), boletin.getMaterias().get(0).getPromedioPonderadoAcumulado());
    }
}
