package com.example.backendColegio.repository;

import com.example.backendColegio.model.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CursoRepository extends JpaRepository<Curso, Long> {
    boolean existsByGradoAndGrupoAndAnioLectivo(Integer grado, String grupo, Integer anioLectivo);
    Optional<Curso> findByGradoAndGrupoAndAnioLectivo(Integer grado, String grupo, Integer anioLectivo);
    java.util.List<Curso> findByAnioLectivo(Integer anioLectivo);
}

