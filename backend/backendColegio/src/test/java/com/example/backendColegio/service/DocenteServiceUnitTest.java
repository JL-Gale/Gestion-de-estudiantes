package com.example.backendColegio.service;

import com.example.backendColegio.dto.docente.RegistrarCalificacionRequest;
import com.example.backendColegio.exception.BusinessLogicException;
import com.example.backendColegio.model.CargaAcademica;
import com.example.backendColegio.model.CorteEvaluacion;
import com.example.backendColegio.model.Docente;
import com.example.backendColegio.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocenteServiceUnitTest {

    @Mock
    private DocenteRepository docenteRepository;
    @Mock
    private CargaAcademicaRepository cargaAcademicaRepository;
    @Mock
    private MatriculaRepository matriculaRepository;
    @Mock
    private CorteEvaluacionRepository corteEvaluacionRepository;
    @Mock
    private CalificacionRepository calificacionRepository;
    @Mock
    private EstudianteRepository estudianteRepository;

    @InjectMocks
    private DocenteService docenteService;

    @Test
    @DisplayName("Debe lanzar BusinessLogicException si se intenta calificar fuera de la ventana de fechas del corte")
    void guardarCalificacion_VentanaFechasCerrada_LanzaExcepcion() {
        Long userId = 2L;
        Docente docente = Docente.builder().idDocente(5L).build();
        when(docenteRepository.findByUsuario_IdUsuario(userId)).thenReturn(Optional.of(docente));

        CargaAcademica carga = CargaAcademica.builder().idCarga(10L).docente(docente).build();

        // Corte cerrado (fechas en el pasado: 2026-01-01 a 2026-01-31)
        CorteEvaluacion corteCerrado = CorteEvaluacion.builder()
                .idCorte(100L)
                .nombre("Primer Periodo")
                .cargaAcademica(carga)
                .fechaInicioCalificacion(LocalDate.of(2026, 1, 1))
                .fechaFinCalificacion(LocalDate.of(2026, 1, 31))
                .build();

        when(corteEvaluacionRepository.findById(100L)).thenReturn(Optional.of(corteCerrado));

        RegistrarCalificacionRequest request = new RegistrarCalificacionRequest(1L, 100L, new BigDecimal("4.5"), "Buen desempeño");

        BusinessLogicException exception = assertThrows(BusinessLogicException.class, () ->
                docenteService.guardarCalificacion(userId, request)
        );

        assertTrue(exception.getMessage().contains("El sistema de notas se encuentra cerrado para este periodo"));
    }
}

