package com.example.backendColegio.service;

import com.example.backendColegio.dto.admin.CorteItemRequest;
import com.example.backendColegio.dto.admin.CrearMatriculaRequest;
import com.example.backendColegio.exception.BusinessLogicException;
import com.example.backendColegio.model.CargaAcademica;
import com.example.backendColegio.model.Curso;
import com.example.backendColegio.model.Docente;
import com.example.backendColegio.model.Estudiante;
import com.example.backendColegio.repository.*;
import com.example.backendColegio.util.EmailGeneratorUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BusinessLogicUnitTest {

    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private EstudianteRepository estudianteRepository;
    @Mock
    private DocenteRepository docenteRepository;
    @Mock
    private CursoRepository cursoRepository;
    @Mock
    private AsignaturaRepository asignaturaRepository;
    @Mock
    private CargaAcademicaRepository cargaAcademicaRepository;
    @Mock
    private MatriculaRepository matriculaRepository;
    @Mock
    private CorteEvaluacionRepository corteEvaluacionRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private EmailGeneratorUtil emailGeneratorUtil;

    @InjectMocks
    private AdminService adminService;

    @Test
    @DisplayName("Debe lanzar BusinessLogicException si la suma de porcentajes de cortes no da 100%")
    void configurarCortes_SumaDiferenteDe100_LanzaExcepcion() {
        CargaAcademica cargaMock = CargaAcademica.builder().idCarga(1L).build();
        when(cargaAcademicaRepository.findById(1L)).thenReturn(Optional.of(cargaMock));

        List<CorteItemRequest> cortes = List.of(
                CorteItemRequest.builder().nombre("Periodo 1").porcentaje(new BigDecimal("30.00")).build(),
                CorteItemRequest.builder().nombre("Periodo 2").porcentaje(new BigDecimal("30.00")).build()
        ); // Suma = 60%, no 100%

        BusinessLogicException exception = assertThrows(BusinessLogicException.class, () ->
                adminService.configurarCortes(1L, cortes)
        );

        assertTrue(exception.getMessage().contains("debe ser exactamente 100%"));
    }

    @Test
    @DisplayName("Debe lanzar BusinessLogicException al intentar eliminar un docente con cargas académicas activas")
    void eliminarDocente_ConCargasActivas_LanzaExcepcion() {
        when(docenteRepository.findById(2L)).thenReturn(Optional.of(mock(Docente.class)));
        when(cargaAcademicaRepository.existsByDocente_IdDocente(2L)).thenReturn(true);

        BusinessLogicException exception = assertThrows(BusinessLogicException.class, () ->
                adminService.eliminarDocente(2L)
        );

        assertTrue(exception.getMessage().contains("tiene cargas académicas asignadas"));
    }

    @Test
    @DisplayName("Debe lanzar BusinessLogicException si fechaInicioCalificacion es posterior a fechaFinCalificacion")
    void configurarCortes_FechasInvertidas_LanzaExcepcion() {
        CargaAcademica cargaMock = CargaAcademica.builder().idCarga(1L).build();
        when(cargaAcademicaRepository.findById(1L)).thenReturn(Optional.of(cargaMock));

        List<CorteItemRequest> cortes = List.of(
                CorteItemRequest.builder()
                        .nombre("Periodo 1")
                        .porcentaje(new BigDecimal("100.00"))
                        .fechaInicioCalificacion(LocalDate.of(2026, 6, 30))
                        .fechaFinCalificacion(LocalDate.of(2026, 6, 1)) // Fecha fin anterior a fecha inicio
                        .build()
        );

        BusinessLogicException exception = assertThrows(BusinessLogicException.class, () ->
                adminService.configurarCortes(1L, cortes)
        );

        assertTrue(exception.getMessage().contains("no puede ser anterior"));
    }

    @Test
    @DisplayName("Debe lanzar BusinessLogicException al intentar matricular en un año fuera del rango permitido")
    void crearMatricula_AnioInvalido_LanzaExcepcion() {
        Estudiante estudiante = Estudiante.builder().idEstudiante(1L).build();
        when(estudianteRepository.findById(1L)).thenReturn(Optional.of(estudiante));

        // Curso de 2020 (menor que el año actual 2026)
        Curso cursoPasado = Curso.builder().idCurso(10L).anioLectivo(2020).build();
        when(cursoRepository.findById(10L)).thenReturn(Optional.of(cursoPasado));

        CrearMatriculaRequest request = new CrearMatriculaRequest(1L, 10L);

        BusinessLogicException exception = assertThrows(BusinessLogicException.class, () ->
                adminService.crearMatricula(request)
        );

        assertTrue(exception.getMessage().contains("No se puede matricular en el periodo"));
    }

    @Test
    @DisplayName("Debe buscar estudiantes filtrando por criterio con paginación/límite")
    void buscarEstudiantes_ConCriterio_RetornaCoincidencias() {
        Estudiante e = Estudiante.builder()
                .idEstudiante(1L)
                .nombres("Jorge")
                .apellidos("García")
                .numeroDocumento("1052345678")
                .build();
        PageRequest pageRequest = PageRequest.of(0, 20);
        when(estudianteRepository.buscarEstudiantes("1052", pageRequest)).thenReturn(List.of(e));

        var resultados = adminService.buscarEstudiantes("1052", pageRequest);

        assertNotNull(resultados);
        assertEquals(1, resultados.size());
        assertEquals("1052345678", resultados.get(0).getNumeroDocumento());
        assertEquals("Jorge", resultados.get(0).getNombres());
        verify(estudianteRepository).buscarEstudiantes("1052", pageRequest);
    }

    @Test
    @DisplayName("Debe paginar todos los estudiantes cuando el criterio de búsqueda esté vacío")
    void buscarEstudiantes_CriterioVacio_RetornaPaginados() {
        Estudiante e = Estudiante.builder()
                .idEstudiante(2L)
                .nombres("Laura")
                .apellidos("Zapata")
                .numeroDocumento("987654321")
                .build();
        PageRequest pageRequest = PageRequest.of(0, 10);
        when(estudianteRepository.findAll(pageRequest)).thenReturn(new PageImpl<>(List.of(e)));

        var resultados = adminService.buscarEstudiantes("", pageRequest);

        assertNotNull(resultados);
        assertEquals(1, resultados.size());
        assertEquals("Laura", resultados.get(0).getNombres());
        verify(estudianteRepository).findAll(pageRequest);
    }
}
