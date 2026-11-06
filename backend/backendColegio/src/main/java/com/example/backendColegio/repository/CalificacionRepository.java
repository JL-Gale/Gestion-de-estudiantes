package com.example.backendColegio.repository;

import com.example.backendColegio.model.Calificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CalificacionRepository extends JpaRepository<Calificacion, Long> {
    Optional<Calificacion> findByEstudiante_IdEstudianteAndCorte_IdCorte(Long idEstudiante, Long idCorte);
    List<Calificacion> findByEstudiante_IdEstudiante(Long idEstudiante);
    List<Calificacion> findByCorte_CargaAcademica_IdCarga(Long idCarga);
    List<Calificacion> findByEstudiante_IdEstudianteAndCorte_CargaAcademica_IdCarga(Long idEstudiante, Long idCarga);
}
