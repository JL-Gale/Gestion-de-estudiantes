package com.example.backendColegio.repository;

import com.example.backendColegio.model.Docente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface DocenteRepository extends JpaRepository<Docente, Long> {
    Optional<Docente> findByUsuario_IdUsuario(Long idUsuario);
    Optional<Docente> findByNumeroDocumento(String numeroDocumento);
    boolean existsByNumeroDocumento(String numeroDocumento);
    Optional<Docente> findByUsuario_CorreoInstitucionalAndNumeroDocumentoAndFechaNacimiento(
            String correoInstitucional, String numeroDocumento, LocalDate fechaNacimiento);
}

