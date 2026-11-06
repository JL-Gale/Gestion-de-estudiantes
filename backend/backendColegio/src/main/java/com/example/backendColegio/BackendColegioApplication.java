package com.example.backendColegio;

import com.example.backendColegio.model.Usuario;
import com.example.backendColegio.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BackendColegioApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendColegioApplication.class, args);
	}

	@Bean
    CommandLineRunner initDatabase(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Verifica si el admin ya existe para no duplicarlo cada vez que inicies el servidor
            if (usuarioRepository.findByCorreoInstitucional("admin@colegio.edu.co").isEmpty()) {
                Usuario admin = new Usuario();
                admin.setCorreoInstitucional("admin@colegio.edu.co");
                admin.setPassword(passwordEncoder.encode("admin123")); // Spring encripta la clave aquí
                admin.setRol("ADMIN");
                admin.setEstado(true);
                
                usuarioRepository.save(admin);
                System.out.println("✅ Administrador inicial creado con éxito: admin@colegio.edu.co / admin123");
            }
        };
    }

}
