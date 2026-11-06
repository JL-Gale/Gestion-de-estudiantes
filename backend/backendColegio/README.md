# 📚 Documentación Técnica de la API REST - Sistema Escolar (Colegio v2)

Backend desarrollado con **Spring Boot 4 / Java 26**, **PostgreSQL** y **Spring Security (JWT)** con contraseñas encriptadas mediante `BCryptPasswordEncoder`.

---

## 📑 Tabla de Contenidos
1. [Configuración y Acceso](#1-configuración-y-acceso)
2. [Documentación Interactiva (Swagger / OpenAPI)](#2-documentación-interactiva-swagger--openapi)
3. [Manejo Centralizado de Errores](#3-manejo-centralizado-de-errores)
4. [Módulo 1: Autenticación y Seguridad (AuthController)](#4-módulo-1-autenticación-y-seguridad-authcontroller)
5. [Módulo 2: Configuración de Cuenta Compartida (CuentaController)](#5-módulo-2-configuración-de-cuenta-compartida-cuentacontroller)
6. [Módulo 3: Panel de Administración (AdminController)](#6-módulo-3-panel-de-administración-admincontroller)
   - [3.1 Gestión de Estudiantes](#31-gestión-de-estudiantes)
   - [3.2 Gestión de Docentes](#32-gestión-de-docentes)
   - [3.3 Gestión de Asignaturas (Catálogo Base)](#33-gestión-de-asignaturas)
   - [3.4 Gestión de Cursos (Grados y Grupos)](#34-gestión-de-cursos)
   - [3.5 Carga Académica y Cortes de Evaluación](#35-carga-académica-y-cortes-de-evaluación)
   - [3.6 Matrículas de Estudiantes](#36-matrículas-de-estudiantes)
7. [Módulo 4: Panel del Docente (DocenteController)](#7-módulo-4-panel-del-docente-docentecontroller)
8. [Módulo 5: Panel del Estudiante (EstudianteController)](#8-módulo-5-panel-del-estudiante-estudiantecontroller)

---

## 1. Configuración y Acceso

### Base de Datos PostgreSQL
- **Host**: `localhost`
- **Puerto**: `5432`
- **Base de Datos**: `db_colegio`
- **Usuario**: `admin_colegio`
- **Contraseña**: `1234`
- **Estrategia Hibernate**: `spring.jpa.hibernate.ddl-auto=none` *(No altera ni recrea tablas existentes)*

### Usuario Administrador Inicial Autogenerado
- **Correo Institucional**: `admin@colegio.edu.co`
- **Contraseña**: `admin123`
- **Rol**: `ADMIN`

### Configuración de CORS para Angular
- **Orígenes Permitidos**: `http://localhost:4200`, `http://127.0.0.1:4200` y variantes locales (`http://localhost:*`, `http://127.0.0.1:*`).
- **Métodos**: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`, `PATCH`.
- **Preflight**: Caché de 3600 segundos (1 hora).
- **Credenciales y Cabeceras**: `Authorization` expuesta y aceptada.

### Formato de Autenticación
Todas las peticiones a endpoints protegidos deben incluir la cabecera HTTP:
```http
Authorization: Bearer <TU_TOKEN_JWT>
```

---

## 2. Documentación Interactiva (Swagger / OpenAPI)

- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Especificación OpenAPI (JSON)**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

Para autenticarte en Swagger UI:
1. Envía `POST /api/auth/login` con tus credenciales.
2. Copia el valor de `token`.
3. Haz clic en el botón superior derecho **Authorize 🔓**, pega el token y pulsa **Authorize**.

---

## 3. Manejo Centralizado de Errores

Formato JSON unificado devuelto por `@RestControllerAdvice`:
```json
{
  "timestamp": "2026-11-05T19:30:00",
  "status": 422,
  "error": "Unprocessable Entity",
  "message": "La suma de los porcentajes de los cortes debe ser exactamente 100%. Suma actual: 80%",
  "path": "/api/admin/cargas-academicas/1/cortes",
  "details": null
}
```

---

## 4. Módulo 1: Autenticación y Seguridad (`AuthController`)
**Acceso**: Público (Sin Token)

---

### `POST /api/auth/login`
Inicia sesión y genera el token JWT con rol (`ADMIN`, `DOCENTE`, `ESTUDIANTE`) e ID de usuario.

- **Body de Petición**:
```json
{
  "correo_institucional": "admin@colegio.edu.co",
  "password": "admin123"
}
```
*(Nota: Acepta también `correoInstitucional` y `contrasena`)*
- **Respuesta Exitosa (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkBjb2xlZ2lvLmVkdS5jbyIsInVzZXJJZCI6MSwicm9sZSI6IkFETUlOIn0...",
  "tipo": "Bearer",
  "idUsuario": 1,
  "correoInstitucional": "admin@colegio.edu.co",
  "rol": "ADMIN"
}
```
- **Ejemplo cURL**:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo_institucional":"admin@colegio.edu.co","password":"admin123"}'
```

---

### `POST /api/auth/recuperar-password`
Verifica coincidencias de datos en la tabla `docente` o `estudiante`. Si coinciden, hashea el `numero_documento` con BCrypt, actualiza `usuario.password` y responde con mensaje de confirmación.

- **Body de Petición**:
```json
{
  "correo_institucional": "carlos.perez@colegio.edu.co",
  "numero_documento": "1098765432",
  "fecha_nacimiento": "1985-06-15"
}
```
- **Respuesta Exitosa (200 OK)**:
```json
{
  "message": "Contraseña restablecida exitosamente a su número de identidad."
}
```

---

## 5. Módulo 2: Configuración de Cuenta Compartida (`CuentaController`)
**Acceso**: Protegido (Cualquier rol autenticado: `ADMIN`, `DOCENTE`, `ESTUDIANTE`)

---

### `PUT /api/cuenta/cambiar-password`
Permite a cualquier usuario cambiar su contraseña inicial por una nueva.

- **Body de Petición**:
```json
{
  "contrasenaActual": "1098765432",
  "nuevaContrasena": "MiNuevoPassword2026*"
}
```
- **Respuesta Exitosa (200 OK)**:
```json
{
  "message": "Contraseña actualizada exitosamente."
}
```

---

## 6. Módulo 3: Panel de Administración (`AdminController`)
**Acceso**: Protegido (Solo rol `ADMIN`)

---

### 3.1 Gestión de Estudiantes

#### `POST /api/admin/estudiantes`
Recibe los datos del estudiante. El backend **autogenera** el `correo_institucional` (ej. `juan.rodriguez@colegio.edu.co`), toma el `numero_documento`, lo hashea con BCrypt y lo guarda como password en la tabla `usuario`, luego inserta el registro en la tabla `estudiante`.

- **Body de Petición**:
```json
{
  "numero_documento": "1025896321",
  "nombres": "Juan Camilo",
  "apellidos": "Rodríguez Gómez",
  "fecha_nacimiento": "2009-03-24",
  "telefono": "3001234567"
}
```
- **Respuesta Exitosa (201 Created)**:
```json
{
  "idEstudiante": 1,
  "numeroDocumento": "1025896321",
  "nombres": "Juan Camilo",
  "apellidos": "Rodríguez Gómez",
  "fechaNacimiento": "2009-03-24",
  "telefono": "3001234567",
  "correoInstitucional": "juan.rodriguez@colegio.edu.co",
  "idUsuario": 2
}
```

#### `GET /api/admin/estudiantes`
Devuelve la lista de estudiantes. Para soportar miles de registros eficientemente sin saturar ancho de banda ni memoria, admite búsqueda con paginación/límite:
- **Query Params (opcionales)**:
  - `search` (o `q`): Criterio de búsqueda (busca coincidencias en nombres, apellidos, nombre completo, documento o correo institucional).
  - `limit`: Cantidad máxima de registros a retornar (por defecto `20`, máx `100`).
- **Ejemplo**: `GET /api/admin/estudiantes?search=1052&limit=20`

#### `GET /api/admin/estudiantes/buscar`
Endpoint dedicado para autocompletado en interfaces Angular (ej: selector de estudiantes en el formulario de matrículas):
- **Query Params**:
  - `q` (o `search`): Texto ingresado por el usuario (ej: `jorge`).
  - `limit`: Límite de resultados (por defecto `20`).
- **Ejemplo**: `GET /api/admin/estudiantes/buscar?q=jorge&limit=15`

#### `GET /api/admin/estudiantes/{id}`
Retorna el detalle de un estudiante.

#### `PUT /api/admin/estudiantes/{id}`
Permite corregir datos personales del estudiante.
- **Body de Petición**:
```json
{
  "nombres": "Juan Camilo",
  "apellidos": "Rodríguez Gómez",
  "fecha_nacimiento": "2009-03-24",
  "telefono": "3009876543"
}
```

#### `DELETE /api/admin/estudiantes/{id}`
Elimina al estudiante y su usuario asociado en cascada.

---

### 3.2 Gestión de Docentes

#### `POST /api/admin/docentes`
Crea el docente y su usuario asociado con rol `DOCENTE`. Autogenera el correo institucional y usa el `numero_documento` como contraseña inicial hasheada.

- **Body de Petición**:
```json
{
  "numero_documento": "1098765432",
  "nombres": "Carlos Alberto",
  "apellidos": "Pérez Morales",
  "fecha_nacimiento": "1985-06-15",
  "telefono": "3105554321"
}
```
- **Respuesta Exitosa (201 Created)**:
```json
{
  "idDocente": 1,
  "numeroDocumento": "1098765432",
  "nombres": "Carlos Alberto",
  "apellidos": "Pérez Morales",
  "fechaNacimiento": "1985-06-15",
  "telefono": "3105554321",
  "correoInstitucional": "carlos.perez@colegio.edu.co",
  "idUsuario": 3
}
```

#### `GET /api/admin/docentes` | `GET /api/admin/docentes/{id}` | `PUT /api/admin/docentes/{id}` | `DELETE /api/admin/docentes/{id}`
CRUD completo para docentes. Valida que no se pueda eliminar un docente con cargas académicas asignadas (`422 Unprocessable Entity`).

---

### 3.3 Gestión de Asignaturas

#### `POST /api/admin/asignaturas`
Gestiona el catálogo general en la tabla `asignatura`.

- **Body de Petición**:
```json
{
  "nombre": "Ciencias Naturales"
}
```
- **Respuesta Exitosa (201 Created)**:
```json
{
  "idAsignatura": 1,
  "nombre": "Ciencias Naturales"
}
```

#### `GET /api/admin/asignaturas` | `GET /api/admin/asignaturas/{id}` | `PUT /api/admin/asignaturas/{id}` | `DELETE /api/admin/asignaturas/{id}`
CRUD del catálogo de asignaturas.

---

### 3.4 Gestión de Cursos

#### `POST /api/admin/cursos`
Crea los grados y grupos en la tabla `curso` (Ej: 10mo A 2026).

- **Body de Petición**:
```json
{
  "grado": 10,
  "grupo": "A",
  "anio_lectivo": 2026
}
```
- **Respuesta Exitosa (201 Created)**:
```json
{
  "idCurso": 1,
  "grado": 10,
  "grupo": "A",
  "anioLectivo": 2026,
  "nombreCompleto": "10° A (2026)"
}
```

#### `GET /api/admin/cursos`
Devuelve la lista de cursos registrados exclusivamente para el **año lectivo vigente** (`Year.now()`).

#### `GET /api/admin/historial/cursos/{anio}`
Retorna los cursos (grados y grupos) que existieron en el año especificado por parámetro (`{anio}`).

#### `GET /api/admin/cursos/{id}` | `PUT /api/admin/cursos/{id}` | `DELETE /api/admin/cursos/{id}`
CRUD individual de cursos/salones.
**Reglas de negocio validadas**:
- No se puede eliminar un curso si tiene alumnos matriculados o cargas activas (`422 Unprocessable Entity`).
- **Bloqueo de edición histórica (`PUT`)**: No se pueden editar cursos pertenecientes a años lectivos anteriores al actual (`curso.anioLectivo < Year.now().getValue()`). Retorna `422 Unprocessable Entity` (*"Los cursos de años anteriores son históricos y no se pueden editar."*).

---

### 3.5 Carga Académica y Cortes de Evaluación

#### `POST /api/admin/cargas-academicas`
Asigna un docente a una asignatura dentro de un curso, creando el registro en `carga_academica`.

- **Body de Petición**:
```json
{
  "id_curso": 1,
  "id_asignatura": 1,
  "id_docente": 1
}
```
- **Respuesta Exitosa (201 Created)**:
```json
{
  "idCarga": 1,
  "idCurso": 1,
  "curso": "10° A (2026)",
  "idAsignatura": 1,
  "asignatura": "Ciencias Naturales",
  "idDocente": 1,
  "docente": "Carlos Alberto Pérez Morales"
}
```

#### `GET /api/admin/cargas-academicas`
Lista todas las asignaciones de clases correspondientes exclusivamente al **año lectivo actual** (`Year.now().getValue()`).

#### `GET /api/admin/historial/cargas-academicas/{anio}`
Retorna las cargas académicas (asignaciones docente-materia-curso) registradas para un año escolar histórico específico (`{anio}`). Permite consultar periodos anteriores sin alterar la operación actual.

- **Respuesta Exitosa (200 OK)**:
```json
[
  {
    "idCarga": 10,
    "idCurso": 8,
    "curso": "11° B (2025)",
    "idAsignatura": 2,
    "asignatura": "Matemáticas",
    "idDocente": 1,
    "docente": "Carlos Alberto Pérez Morales"
  }
]
```

#### `DELETE /api/admin/cargas-academicas/{id}`
Elimina una carga académica y sus cortes/notas asociados en cascada.

#### `POST /api/admin/cargas-academicas/{idCarga}/cortes`
Crea o reemplaza los registros en `corte_evaluacion` para una materia específica de un salón.
**Reglas de negocio validadas**:
- La suma de porcentajes debe ser exactamente **100%**.
- **Fechas opcionales**: Las fechas `fecha_inicio_calificacion` y `fecha_fin_calificacion` son **opcionales** (pueden enviarse como `null` o vacías), permitiendo configurar cortes evaluativos futuros sin forzar a definir las fechas desde el inicio de año.
- **Validación de coherencia temporal**: Si se define una fecha, ambas son obligatorias; y `fecha_inicio_calificacion` no puede ser posterior a `fecha_fin_calificacion` (`422 Unprocessable Entity`).

- **Body de Petición con fechas opcionales**:
```json
[
  {
    "nombre": "1er Periodo",
    "porcentaje": 30.00,
    "fecha_inicio_calificacion": "2026-02-01",
    "fecha_fin_calificacion": "2026-04-15"
  },
  {
    "nombre": "2do Periodo",
    "porcentaje": 30.00,
    "fecha_inicio_calificacion": null,
    "fecha_fin_calificacion": null
  },
  {
    "nombre": "3er Periodo",
    "porcentaje": 40.00,
    "fecha_inicio_calificacion": null,
    "fecha_fin_calificacion": null
  }
]
```
- **Respuesta Exitosa (201 Created)**:
```json
[
  {
    "idCorte": 1,
    "idCarga": 1,
    "nombre": "1er Periodo",
    "porcentaje": 30.00,
    "fechaInicioCalificacion": "2026-02-01",
    "fechaFinCalificacion": "2026-04-15"
  },
  {
    "idCorte": 2,
    "idCarga": 1,
    "nombre": "2do Periodo",
    "porcentaje": 30.00,
    "fechaInicioCalificacion": null,
    "fechaFinCalificacion": null
  },
  {
    "idCorte": 3,
    "idCarga": 1,
    "nombre": "3er Periodo",
    "porcentaje": 40.00,
    "fechaInicioCalificacion": null,
    "fechaFinCalificacion": null
  }
]
```

#### `GET /api/admin/cargas-academicas/{idCarga}/cortes`
Retorna los cortes configurados para esa carga académica con sus porcentajes y ventanas de fechas habilitadas (o `null` si no tienen fecha).

---

### 3.6 Matrículas de Estudiantes

#### `POST /api/admin/matriculas`
Inscribe a un estudiante en un curso completo (salón), guardando en la tabla `matricula`.
**Reglas de negocio validadas**:
- Verifica el `anio_lectivo` del curso: debe ser igual al año actual o al año siguiente (`actual + 1`). De lo contrario devuelve `422 Unprocessable Entity`.
- Verifica que el estudiante no esté ya matriculado en el mismo curso (`422 Unprocessable Entity`).

- **Body de Petición**:
```json
{
  "id_estudiante": 1,
  "id_curso": 1
}
```
- **Respuesta Exitosa (201 Created)**:
```json
{
  "idMatricula": 1,
  "idEstudiante": 1,
  "nombreEstudiante": "Juan Camilo Rodríguez Gómez",
  "numeroDocumento": "1025896321",
  "idCurso": 1,
  "curso": "10° A (2026)",
  "fechaMatricula": "2026-11-05T19:30:00"
}
```

#### `GET /api/admin/matriculas`
Listado de todas las matrículas registradas en el sistema.

#### `GET /api/admin/historial/matriculas/{anio}`
Retorna el listado de todos los estudiantes matriculados en un año específico pasado.

#### `DELETE /api/admin/matriculas/{id}`
Eliminar la matrícula de un estudiante.

---

## 7. Módulo 4: Panel del Docente (`DocenteController`)
**Acceso**: Protegido (Solo rol `DOCENTE`)

---

### `GET /api/docente/mis-cargas`
Retorna los registros de `carga_academica` vinculados al `id_docente` del usuario logueado para el **año actual** (`Year.now()`). Le muestra al profesor qué materias dicta y en qué salones (cursos) en el periodo escolar vigente.

- **Respuesta Exitosa (200 OK)**:
```json
[
  {
    "idCarga": 1,
    "idCurso": 1,
    "curso": "10° A (2026)",
    "idAsignatura": 1,
    "asignatura": "Ciencias Naturales"
  }
]
```

---

### `GET /api/docente/historial/mis-cargas/{anio}`
Permite al profesor consultar qué materias dictó y en qué salones durante un año anterior específico.

---

### `GET /api/docente/cargas/{idCarga}/estudiantes`
Busca el curso asociado a la carga y retorna todos los registros de la tabla `estudiante` vinculados mediante la tabla `matricula`. Valida que el docente logueado sea el titular de dicha carga académica (`403 Forbidden` si pertenece a otro docente).

- **Respuesta Exitosa (200 OK)**:
```json
[
  {
    "idEstudiante": 1,
    "numeroDocumento": "1025896321",
    "nombres": "Juan Camilo",
    "apellidos": "Rodríguez Gómez",
    "telefono": "3001234567"
  }
]
```

---

### `GET /api/docente/cargas/{idCarga}/cortes`
Retorna los periodos de evaluación configurados en `corte_evaluacion` para armar la tabla de notas en Angular, incluyendo sus porcentajes y rango de fechas habilitadas.

- **Respuesta Exitosa (200 OK)**:
```json
[
  {
    "idCorte": 1,
    "idCarga": 1,
    "nombre": "1er Periodo",
    "porcentaje": 30.00,
    "fechaInicioCalificacion": "2026-02-01",
    "fechaFinCalificacion": "2026-04-15"
  },
  {
    "idCorte": 2,
    "idCarga": 1,
    "nombre": "2do Periodo",
    "porcentaje": 30.00,
    "fechaInicioCalificacion": null,
    "fechaFinCalificacion": null
  },
  {
    "idCorte": 3,
    "idCarga": 1,
    "nombre": "3er Periodo",
    "porcentaje": 40.00,
    "fechaInicioCalificacion": null,
    "fechaFinCalificacion": null
  }
]
```

---

### `GET /api/docente/cargas/{idCarga}/calificaciones`
Retorna todas las calificaciones registradas previamente para los estudiantes en los cortes de la carga académica dada (`idCarga`). Permite poblar la planilla de calificaciones del docente sin perder las notas históricas o ya asignadas.
**Seguridad**: Valida que el docente logueado sea el titular de dicha carga académica (`403 Forbidden` si pertenece a otro profesor).

- **Respuesta Exitosa (200 OK)**:
```json
[
  {
    "idCalificacion": 1,
    "idEstudiante": 2,
    "nombreEstudiante": "Juan Camilo Rodríguez Gómez",
    "idCorte": 1,
    "nombreCorte": "1er Periodo",
    "porcentajeCorte": 30.00,
    "nota": 4.50,
    "observaciones": "Excelente trabajo en laboratorios"
  }
]
```

---

### `POST /api/docente/calificaciones`
Recibe `id_estudiante`, `id_corte`, `nota` (0.0 a 5.0) y `observaciones`. **Inserta o actualiza (upsert)** el registro en la tabla `calificacion`.

**Reglas de negocio validadas**:
- **Fechas configuradas requeridas**: Valida que el corte tenga definidas sus fechas de inicio y fin (`fecha_inicio_calificacion` y `fecha_fin_calificacion` no sean `null`). Si el corte no tiene fechas, devuelve `422 Unprocessable Entity` (*"El periodo ({nombre}) aún no tiene habilitadas las fechas de calificación."*).
- **Ventana de calificación activa**: Valida que la fecha actual (`LocalDate.now()`) esté comprendida entre `fecha_inicio_calificacion` y `fecha_fin_calificacion` del corte correspondiente. Si la ventana está cerrada o caducó, devuelve `422 Unprocessable Entity` (*"El sistema de notas se encuentra cerrado para este periodo ({nombre}). Fechas habilitadas: {inicio} a {fin}."*).
- Valida que el docente sea el titular de la materia (`403 Forbidden`).
- Valida que el estudiante esté matriculado en el curso de la carga académica (`422 Unprocessable Entity`).

- **Body de Petición**:
```json
{
  "id_estudiante": 1,
  "id_corte": 1,
  "nota": 4.50,
  "observaciones": "Excelente trabajo en laboratorios"
}
```
- **Respuesta Exitosa (201 Created)**:
```json
{
  "idCalificacion": 1,
  "idEstudiante": 1,
  "nombreEstudiante": "Juan Camilo Rodríguez Gómez",
  "idCorte": 1,
  "nombreCorte": "1er Periodo",
  "porcentajeCorte": 30.00,
  "nota": 4.50,
  "observaciones": "Excelente trabajo en laboratorios"
}
```

---

## 8. Módulo 5: Panel del Estudiante (`EstudianteController`)
**Acceso**: Protegido (Solo rol `ESTUDIANTE`)

---

### `GET /api/estudiante/mi-curso`
Consulta la tabla `matricula` usando el `id_estudiante` logueado para mostrar en qué curso (grado y grupo) está inscrito para el **año actual** (`Year.now()`).

- **Respuesta Exitosa (200 OK)**:
```json
{
  "idCurso": 1,
  "grado": 10,
  "grupo": "A",
  "anioLectivo": 2026,
  "nombreCompleto": "10° A (2026)",
  "fechaMatricula": "2026-11-05T19:30:00"
}
```

---

### `GET /api/estudiante/mis-notas`
Cruza los datos de `calificacion`, `corte_evaluacion`, `carga_academica` y `asignatura` del **año actual** para entregarle al estudiante un reporte completo de sus notas en cada materia, calculando el **promedio ponderado acumulado**:

$$\text{Promedio Ponderado Acumulado} = \sum_{i=1}^{n} \left( \text{nota}_i \times \frac{\text{porcentaje}_i}{100} \right)$$

- **Respuesta Exitosa (200 OK)**:
```json
{
  "idEstudiante": 1,
  "nombreEstudiante": "Juan Camilo Rodríguez Gómez",
  "numeroDocumento": "1025896321",
  "curso": "10° A (2026)",
  "materias": [
    {
      "idCarga": 1,
      "idAsignatura": 1,
      "nombreAsignatura": "Ciencias Naturales",
      "nombreDocente": "Carlos Alberto Pérez Morales",
      "cortes": [
        {
          "idCorte": 1,
          "nombreCorte": "1er Periodo",
          "porcentaje": 30.00,
          "fechaInicioCalificacion": "2026-02-01",
          "fechaFinCalificacion": "2026-04-15",
          "idCalificacion": 1,
          "nota": 4.50,
          "observaciones": "Excelente trabajo en laboratorios"
        },
        {
          "idCorte": 2,
          "nombreCorte": "2do Periodo",
          "porcentaje": 30.00,
          "fechaInicioCalificacion": "2026-04-16",
          "fechaFinCalificacion": "2026-07-15",
          "idCalificacion": null,
          "nota": null,
          "observaciones": null
        },
        {
          "idCorte": 3,
          "nombreCorte": "3er Periodo",
          "porcentaje": 40.00,
          "fechaInicioCalificacion": "2026-07-16",
          "fechaFinCalificacion": "2026-11-20",
          "idCalificacion": null,
          "nota": null,
          "observaciones": null
        }
      ],
      "promedioPonderadoAcumulado": 1.35,
      "porcentajeEvaluado": 30.00
    }
  ]
}
```

---

### `GET /api/estudiante/historial/mis-notas/{anio}`
Genera el mismo reporte de notas del estudiante cruzando los datos exclusivamente con la matrícula y cargas académicas del año solicitado (`{anio}`), permitiendo al estudiante consultar boletines de años lectivos anteriores.
*(Nota para Frontend Angular: Si `idCalificacion` es `null`, la casilla de nota se muestra pendiente o vacía)*
