package com.example.backendColegio.controller;

import com.example.backendColegio.dto.auth.AuthResponse;
import com.example.backendColegio.dto.auth.LoginRequest;
import com.example.backendColegio.dto.auth.RecuperarPasswordRequest;
import com.example.backendColegio.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "1. Módulo Público y de Autenticación", description = "Endpoints públicos para inicio de sesión y recuperación de contraseña")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Recibe correo_institucional y contraseña. Devuelve el Token JWT con rol e ID del usuario.")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/recuperar-password")
    @Operation(summary = "Recuperar contraseña", description = "Recibe correo_institucional, numero_documento y fecha_nacimiento. Si coinciden con docente o estudiante, restablece la contraseña al número de documento encriptado con BCrypt.")
    public ResponseEntity<Map<String, String>> recuperarPassword(@Valid @RequestBody RecuperarPasswordRequest request) {
        String mensaje = authService.recuperarPassword(request);
        return ResponseEntity.ok(Map.of("message", mensaje));
    }
}
