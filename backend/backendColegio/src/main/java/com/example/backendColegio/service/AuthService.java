package com.example.backendColegio.service;

import com.example.backendColegio.config.JwtService;
import com.example.backendColegio.dto.auth.AuthResponse;
import com.example.backendColegio.dto.auth.LoginRequest;
import com.example.backendColegio.dto.auth.RecuperarPasswordRequest;
import com.example.backendColegio.exception.ResourceNotFoundException;
import com.example.backendColegio.model.Docente;
import com.example.backendColegio.model.Estudiante;
import com.example.backendColegio.model.Rol;
import com.example.backendColegio.model.Usuario;
import com.example.backendColegio.repository.DocenteRepository;
import com.example.backendColegio.repository.EstudianteRepository;
import com.example.backendColegio.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final EstudianteRepository estudianteRepository;
    private final DocenteRepository docenteRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String correo = request.getCorreoInstitucional().trim().toLowerCase();
        Usuario usuario = usuarioRepository.findByCorreoInstitucional(correo)
                .orElseThrow(() -> new BadCredentialsException("Credenciales inválidas"));

        if (Boolean.FALSE.equals(usuario.getEstado())) {
            throw new BadCredentialsException("La cuenta de usuario se encuentra inactiva");
        }

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new BadCredentialsException("Credenciales inválidas");
        }

        String token = jwtService.generateToken(usuario.getIdUsuario(), usuario.getCorreoInstitucional(), usuario.getRol());

        return AuthResponse.builder()
                .token(token)
                .tipo("Bearer")
                .idUsuario(usuario.getIdUsuario())
                .correoInstitucional(usuario.getCorreoInstitucional())
                .rol(usuario.getRol())
                .build();
    }

    @Transactional
    public String recuperarPassword(RecuperarPasswordRequest request) {
        String correo = request.getCorreoInstitucional().trim().toLowerCase();
        String doc = request.getNumeroDocumento().trim();

        Usuario usuario = usuarioRepository.findByCorreoInstitucional(correo)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró ningún usuario con los datos suministrados"));

        boolean datosCoinciden = false;

        if (Rol.DOCENTE.name().equalsIgnoreCase(usuario.getRol())) {
            Optional<Docente> docenteOpt = docenteRepository.findByUsuario_CorreoInstitucionalAndNumeroDocumentoAndFechaNacimiento(
                    correo, doc, request.getFechaNacimiento());
            datosCoinciden = docenteOpt.isPresent();
        } else if (Rol.ESTUDIANTE.name().equalsIgnoreCase(usuario.getRol())) {
            Optional<Estudiante> estudianteOpt = estudianteRepository.findByUsuario_CorreoInstitucionalAndNumeroDocumentoAndFechaNacimiento(
                    correo, doc, request.getFechaNacimiento());
            datosCoinciden = estudianteOpt.isPresent();
        } else if (Rol.ADMIN.name().equalsIgnoreCase(usuario.getRol())) {
            Optional<Docente> docOpt = docenteRepository.findByUsuario_CorreoInstitucionalAndNumeroDocumentoAndFechaNacimiento(
                    correo, doc, request.getFechaNacimiento());
            datosCoinciden = docOpt.isPresent();
        }

        if (!datosCoinciden) {
            throw new ResourceNotFoundException("Los datos proporcionados no coinciden con ningún registro en el sistema");
        }

        // Restablece la contraseña al número de documento encriptado con BCrypt
        usuario.setPassword(passwordEncoder.encode(doc));
        usuarioRepository.save(usuario);

        return "Contraseña restablecida exitosamente a su número de identidad.";
    }
}
