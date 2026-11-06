package com.example.backendColegio.repository;

import com.example.backendColegio.model.Matricula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatriculaRepository extends JpaRepository<Matricula, Long> {
    List<Matricula> findByCurso_IdCurso(Long idCurso);
    List<Matricula> findByCurso_AnioLectivo(Integer anioLectivo);
    Optional<Matricula> findByEstudiante_IdEstudiante(Long idEstudiante);
    Optional<Matricula> findByEstudiante_IdEstudianteAndCurso_AnioLectivo(Long idEstudiante, Integer anioLectivo);
    boolean existsByEstudiante_IdEstudianteAndCurso_IdCurso(Long idEstudiante, Long idCurso);
    boolean existsByCurso_IdCurso(Long idCurso);
    boolean existsByEstudiante_IdEstudiante(Long idEstudiante);
}

