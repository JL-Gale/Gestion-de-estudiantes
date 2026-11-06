package com.example.backendColegio.repository;

import com.example.backendColegio.model.CargaAcademica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CargaAcademicaRepository extends JpaRepository<CargaAcademica, Long> {
    List<CargaAcademica> findByDocente_IdDocente(Long idDocente);
    List<CargaAcademica> findByCurso_AnioLectivo(Integer anioLectivo);
    List<CargaAcademica> findByDocente_IdDocenteAndCurso_AnioLectivo(Long idDocente, Integer anioLectivo);
    List<CargaAcademica> findByCurso_IdCurso(Long idCurso);
    boolean existsByCurso_IdCursoAndAsignatura_IdAsignatura(Long idCurso, Long idAsignatura);
    boolean existsByDocente_IdDocente(Long idDocente);
    boolean existsByAsignatura_IdAsignatura(Long idAsignatura);
    boolean existsByCurso_IdCurso(Long idCurso);
}

