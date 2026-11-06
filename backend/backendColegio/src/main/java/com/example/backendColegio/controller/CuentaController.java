package com.example.backendColegio.controller;

import com.example.backendColegio.config.CustomUserPrincipal;
import com.example.backendColegio.dto.cuenta.CambiarPasswordRequest;
import com.example.backendColegio.service.CuentaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cuenta")
@RequiredArgsConstructor
@Tag(name = "5. Configuración de Cuenta Compartida", description = "Endpoints para la gestión de cuenta personal de cualquier usuario autenticado")
@SecurityRequirement(name = "BearerAuth")
public class CuentaController {

    private final CuentaService cuentaService;

    @PutMapping("/cambiar-password")
    @Operation(summary = "Cambiar contraseña personal", description = "Permite al usuario logueado (docente o estudiante) cambiar la contraseña inicial autogenerada por una nueva de su elección.")
    public ResponseEntity<Map<String, String>> cambiarPassword(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody CambiarPasswordRequest request
    ) {
        cuentaService.cambiarPassword(principal.getIdUsuario(), request);
        return ResponseEntity.ok(Map.of("message", "Contraseña actualizada exitosamente."));
    }
}

