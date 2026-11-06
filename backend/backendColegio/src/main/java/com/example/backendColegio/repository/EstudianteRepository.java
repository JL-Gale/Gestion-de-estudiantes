package com.example.backendColegio.repository;

import com.example.backendColegio.model.Estudiante;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EstudianteRepository extends JpaRepository<Estudiante, Long> {
    Optional<Estudiante> findByUsuario_IdUsuario(Long idUsuario);
    Optional<Estudiante> findByNumeroDocumento(String numeroDocumento);
    boolean existsByNumeroDocumento(String numeroDocumento);
    Optional<Estudiante> findByUsuario_CorreoInstitucionalAndNumeroDocumentoAndFechaNacimiento(
            String correoInstitucional, String numeroDocumento, LocalDate fechaNacimiento);

    @Query("SELECT e FROM Estudiante e LEFT JOIN e.usuario u WHERE " +
           "LOWER(e.nombres) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(e.apellidos) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(CONCAT(e.nombres, ' ', e.apellidos)) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "e.numeroDocumento LIKE CONCAT('%', :q, '%') OR " +
           "LOWER(u.correoInstitucional) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Estudiante> buscarEstudiantes(@Param("q") String q, Pageable pageable);
}
