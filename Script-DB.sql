-- 1. Tabla Usuario (Acceso)
CREATE TABLE usuario (
    id_usuario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    correo_institucional VARCHAR(100) UNIQUE NOT NULL, -- Autogenerado por el backend
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('ADMIN', 'DOCENTE', 'ESTUDIANTE')),
    estado BOOLEAN DEFAULT TRUE
);

-- 2. Tabla Docente
CREATE TABLE docente (
    id_docente INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    numero_documento VARCHAR(20) UNIQUE NOT NULL,
    nombres VARCHAR(50) NOT NULL,
    apellidos VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    telefono VARCHAR(15),
    id_usuario INT UNIQUE NOT NULL,
    CONSTRAINT fk_docente_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- 3. Tabla Estudiante
CREATE TABLE estudiante (
    id_estudiante INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    numero_documento VARCHAR(20) UNIQUE NOT NULL,
    nombres VARCHAR(50) NOT NULL,
    apellidos VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    telefono VARCHAR(15),
    id_usuario INT UNIQUE NOT NULL,
    CONSTRAINT fk_estudiante_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);


-- 4. Tabla Curso (Ej: 1ro A, 11vo B)
CREATE TABLE curso (
    id_curso INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    grado INT NOT NULL CHECK (grado BETWEEN 1 AND 11), -- 1 a 11 (Primaria y Bachillerato)
    grupo VARCHAR(2) NOT NULL, -- 'A', 'B', 'C'
    anio_lectivo INT NOT NULL, -- Ej: 2026
    CONSTRAINT uq_grado_grupo_anio UNIQUE (grado, grupo, anio_lectivo)
);

-- 5. Tabla Asignatura (Catálogo base del Ministerio)
CREATE TABLE asignatura (
    id_asignatura INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL -- Ej: "Ciencias Naturales", "Física"
);

-- 6. Tabla Carga Académica (La Clase)
-- Une el Curso, la Asignatura y el Docente que la dicta
CREATE TABLE carga_academica (
    id_carga INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_curso INT NOT NULL,
    id_asignatura INT NOT NULL,
    id_docente INT NOT NULL,
    CONSTRAINT fk_carga_curso FOREIGN KEY (id_curso) REFERENCES curso(id_curso) ON DELETE CASCADE,
    CONSTRAINT fk_carga_asignatura FOREIGN KEY (id_asignatura) REFERENCES asignatura(id_asignatura) ON DELETE CASCADE,
    CONSTRAINT fk_carga_docente FOREIGN KEY (id_docente) REFERENCES docente(id_docente) ON DELETE CASCADE,
    CONSTRAINT uq_curso_asignatura UNIQUE (id_curso, id_asignatura) -- Un curso no puede tener dos veces la misma materia
);


-- 7. Tabla Matrícula (Asigna el estudiante a un salón completo, ej: 1ro A)
CREATE TABLE matricula (
    id_matricula INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_estudiante INT NOT NULL,
    id_curso INT NOT NULL,
    fecha_matricula TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_matricula_estudiante FOREIGN KEY (id_estudiante) REFERENCES estudiante(id_estudiante) ON DELETE CASCADE,
    CONSTRAINT fk_matricula_curso FOREIGN KEY (id_curso) REFERENCES curso(id_curso) ON DELETE CASCADE,
    CONSTRAINT uq_estudiante_curso UNIQUE (id_estudiante, id_curso)
);

-- 8. Tabla Cortes de Evaluación (Ej: Periodo 1 30%, Periodo 2 30%, Periodo 3 40%)
CREATE TABLE corte_evaluacion (
    id_corte INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_carga INT NOT NULL, -- Se ata a la materia específica de un salón
    nombre VARCHAR(50) NOT NULL, 
    porcentaje NUMERIC(5,2) NOT NULL CHECK (porcentaje > 0 AND porcentaje <= 100),
    CONSTRAINT fk_corte_carga FOREIGN KEY (id_carga) REFERENCES carga_academica(id_carga) ON DELETE CASCADE
);

-- 9. Tabla Calificación
CREATE TABLE calificacion (
    id_calificacion INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_estudiante INT NOT NULL,
    id_corte INT NOT NULL,
    nota NUMERIC(4,2) NOT NULL CHECK (nota >= 0 AND nota <= 5.0), -- Escala tradicional 0.0 a 5.0
    observaciones TEXT,
    CONSTRAINT fk_calif_estudiante FOREIGN KEY (id_estudiante) REFERENCES estudiante(id_estudiante) ON DELETE CASCADE,
    CONSTRAINT fk_calif_corte FOREIGN KEY (id_corte) REFERENCES corte_evaluacion(id_corte) ON DELETE CASCADE,
    CONSTRAINT uq_nota_estudiante_corte UNIQUE (id_estudiante, id_corte)
);

ALTER TABLE corte_evaluacion 
ADD COLUMN fecha_inicio_calificacion DATE,
ADD COLUMN fecha_fin_calificacion DATE;


































