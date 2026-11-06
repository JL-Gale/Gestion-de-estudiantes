package com.example.backendColegio.config;

import com.example.backendColegio.model.Usuario;
import com.example.backendColegio.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String correoInstitucional) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByCorreoInstitucional(correoInstitucional)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con correo institucional: " + correoInstitucional));

        return new CustomUserPrincipal(
                usuario.getIdUsuario(),
                usuario.getCorreoInstitucional(),
                usuario.getPassword(),
                usuario.getRol(),
                Boolean.TRUE.equals(usuario.getEstado())
        );
    }
}
