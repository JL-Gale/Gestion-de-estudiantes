package com.example.backendColegio.repository;

import com.example.backendColegio.model.Asignatura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AsignaturaRepository extends JpaRepository<Asignatura, Long> {
    boolean existsByNombreIgnoreCase(String nombre);
}
