package com.example.backendColegio.util;

import com.example.backendColegio.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
public class EmailGeneratorUtil {

    private final UsuarioRepository usuarioRepository;
    private static final String DOMINIO = "@colegio.edu.co";
    private static final Pattern DIACRITICS_PATTERN = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");

    public String generarCorreoInstitucional(String nombres, String apellidos) {
        String primerNombre = limpiarTexto(nombres.trim().split("\\s+")[0]);
        String primerApellido = limpiarTexto(apellidos.trim().split("\\s+")[0]);

        String base = primerNombre + "." + primerApellido;
        String emailCandidato = base + DOMINIO;

        int contador = 1;
        while (usuarioRepository.existsByCorreoInstitucional(emailCandidato)) {
            emailCandidato = base + contador + DOMINIO;
            contador++;
        }

        return emailCandidato;
    }

    private String limpiarTexto(String texto) {
        if (texto == null) return "";
        String normalizado = Normalizer.normalize(texto, Normalizer.Form.NFD);
        String sinTildes = DIACRITICS_PATTERN.matcher(normalizado).replaceAll("");
        return sinTildes.toLowerCase().replaceAll("[^a-z0-9]", "");
    }
}

