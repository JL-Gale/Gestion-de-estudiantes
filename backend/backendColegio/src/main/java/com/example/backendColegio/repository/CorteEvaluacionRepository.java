package com.example.backendColegio.repository;

import com.example.backendColegio.model.CorteEvaluacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CorteEvaluacionRepository extends JpaRepository<CorteEvaluacion, Long> {
    List<CorteEvaluacion> findByCargaAcademica_IdCarga(Long idCarga);
    void deleteByCargaAcademica_IdCarga(Long idCarga);
}
