package com.example.backendColegio.service;

import com.example.backendColegio.dto.cuenta.CambiarPasswordRequest;
import com.example.backendColegio.exception.BusinessLogicException;
import com.example.backendColegio.exception.ResourceNotFoundException;
import com.example.backendColegio.model.Usuario;
import com.example.backendColegio.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CuentaService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void cambiarPassword(Long idUsuario, CambiarPasswordRequest request) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + idUsuario));

        if (!passwordEncoder.matches(request.getContrasenaActual(), usuario.getPassword())) {
            throw new BusinessLogicException("La contraseña actual proporcionada es incorrecta");
        }

        usuario.setPassword(passwordEncoder.encode(request.getNuevaContrasena()));
        usuarioRepository.save(usuario);
    }
}

