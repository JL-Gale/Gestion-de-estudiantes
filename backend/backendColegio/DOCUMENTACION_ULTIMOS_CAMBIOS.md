# 📋 Documentación de Últimos Cambios Implementados

Este documento detalla todas las modificaciones, reglas de negocio y nuevos endpoints integrados recientemente en el backend del colegio.

---

## 📑 Tabla de Contenidos
1. [Cambios en Base de Datos y Modelo JPA](#1-cambios-en-base-de-datos-y-modelo-jpa)
2. [Filtro Automático por Año Actual en Endpoints Operativos](#2-filtro-automático-por-año-actual-en-endpoints-operativos)
3. [Nuevas Validaciones y Reglas de Negocio (HTTP 422)](#3-nuevas-validaciones-y-reglas-de-negocio-http-422)
4. [Nuevos Endpoints de Historial por Año (`{anio}`)](#4-nuevos-endpoints-de-historial-por-año-anio)
5. [Búsqueda y Autocompletado de Miles de Estudiantes](#5-búsqueda-y-autocompletado-de-miles-de-estudiantes)
6. [Resumen de Endpoints Modificados y Nuevos](#6-resumen-de-endpoints-modificados-y-nuevos)
7. [Pruebas Unitarias y de Integración](#7-pruebas-unitarias-y-de-integración)

---

## 1. Cambios en Base de Datos y Modelo JPA

### Tabla `corte_evaluacion`
Se incorporaron dos columnas de tipo fecha para controlar la ventana de tiempo en la cual los profesores pueden registrar o modificar notas:

```sql
ALTER TABLE corte_evaluacion 
ADD COLUMN fecha_inicio_calificacion DATE,
ADD COLUMN fecha_fin_calificacion DATE;
```

### Entidad JPA (`CorteEvaluacion.java`)
Se mapearon los nuevos atributos:
```java
@Column(name = "fecha_inicio_calificacion")
private LocalDate fechaInicioCalificacion;

@Column(name = "fecha_fin_calificacion")
private LocalDate fechaFinCalificacion;
```

---

## 2. Filtro Automático por Año Actual en Endpoints Operativos

Para evitar mezclar la información histórica de periodos anteriores con la operación académica del día a día, los siguientes endpoints filtran automáticamente por el año lectivo en curso (`Year.now().getValue()`):

1. **`GET /api/admin/cursos`**: Retorna únicamente los cursos (grados y grupos) del año actual.
2. **`GET /api/docente/mis-cargas`**: Devuelve solo las materias y salones asignados al docente para el año en curso.
3. **`GET /api/estudiante/mi-curso`**: Muestra el curso y salón en el que está matriculado el estudiante en el año actual.
4. **`GET /api/estudiante/mis-notas`**: Entrega el boletín de notas cruzando materias, cortes y notas correspondientes exclusivamente al año lectivo actual.

---

## 3. Nuevas Validaciones y Reglas de Negocio (HTTP 422)

Todas las violaciones de reglas de negocio retornan un código HTTP **`422 Unprocessable Entity`** con estructura JSON homogénea:

### A. Ventana de Calificación Cerrada (`POST /api/docente/calificaciones`)
- **Regla**: El docente solo puede registrar o actualizar calificaciones si la fecha de hoy (`LocalDate.now()`) se encuentra entre `fecha_inicio_calificacion` y `fecha_fin_calificacion` del corte.
- **Respuesta de Error si está fuera de rango**:
```json
{
  "timestamp": "2026-11-05T21:20:00",
  "status": 422,
  "error": "Unprocessable Entity",
  "message": "El sistema de notas se encuentra cerrado para este periodo (1er Periodo). Fechas habilitadas: 2026-02-01 a 2026-04-15.",
  "path": "/api/docente/calificaciones"
}
```

### B. Restricción de Periodo en Matrículas (`POST /api/admin/matriculas`)
- **Regla**: Solo se permite matricular estudiantes en cursos cuyo `anio_lectivo` sea el año actual o el año siguiente (`actual + 1`). Se bloquea la matrícula en cursos pasados o futuros no inmediatos.
- **Respuesta de Error si el año no es válido**:
```json
{
  "timestamp": "2026-11-05T21:20:00",
  "status": 422,
  "error": "Unprocessable Entity",
  "message": "No se puede matricular en el periodo 2024. Solo se permite el año actual (2026) o el próximo (2027).",
  "path": "/api/admin/matriculas"
}
```

### C. Flexibilidad de Fechas en Cortes Evaluativos (`POST /api/admin/cargas-academicas/{idCarga}/cortes`)
- **Regla**: Las fechas `fecha_inicio_calificacion` y `fecha_fin_calificacion` son **opcionales** (pueden ser `null`). Esto permite guardar la estructura curricular completa (con suma del 100%) sin obligar a definir desde el inicio del año las fechas de los periodos 2, 3, etc.
- **Validación cronológica condicional**: Si se ingresan fechas, `fecha_inicio_calificacion` no puede ser posterior a `fecha_fin_calificacion` (`422 Unprocessable Entity`).

### D. Bloqueo de Edición de Cursos Históricos (`PUT /api/admin/cursos/{id}`)
- **Regla**: No se permite editar cursos ni grupos correspondientes a años lectivos anteriores al año en curso (`curso.getAnioLectivo() < Year.now().getValue()`).
- **Respuesta de Error**:
```json
{
  "timestamp": "2026-11-06T20:25:00",
  "status": 422,
  "error": "Unprocessable Entity",
  "message": "Los cursos de años anteriores son históricos y no se pueden editar.",
  "path": "/api/admin/cursos/8"
}
```

---

## 4. Nuevos Endpoints de Historial por Año (`{anio}`)

Permiten consultar la información de años lectivos pasados mediante `@PathVariable Integer anio`:

### Módulo Administrador (Rol `ADMIN`)
* **`GET /api/admin/historial/cursos/{anio}`**
  - **Función**: Retorna los cursos (grados y grupos) que existieron en el año especificado.
  - **Ejemplo**: `GET /api/admin/historial/cursos/2024`

* **`GET /api/admin/historial/matriculas/{anio}`**
  - **Función**: Retorna el listado de todos los estudiantes matriculados en un año específico anterior.
  - **Ejemplo**: `GET /api/admin/historial/matriculas/2024`

* **`GET /api/admin/historial/cargas-academicas/{anio}`**
  - **Función**: Retorna las asignaciones de carga académica (curso, asignatura, docente) registradas en un año lectivo histórico.
  - **Ejemplo**: `GET /api/admin/historial/cargas-academicas/2025`

### Módulo Docente (Rol `DOCENTE`)
* **`GET /api/docente/historial/mis-cargas/{anio}`**
  - **Función**: Permite al profesor ver qué asignaturas dictó y en qué salones durante un año anterior.
  - **Ejemplo**: `GET /api/docente/historial/mis-cargas/2025`

### Módulo Estudiante (Rol `ESTUDIANTE`)
* **`GET /api/estudiante/historial/mis-notas/{anio}`**
  - **Función**: Genera el boletín completo de notas cruzando la matrícula, asignaturas, cortes y calificaciones del año solicitado, permitiendo consultar históricos y descargar notas pasadas.
  - **Ejemplo**: `GET /api/estudiante/historial/mis-notas/2024`

---

## 5. Búsqueda y Autocompletado de Miles de Estudiantes

Para evitar saturar la memoria y el ancho de banda al listar grandes volúmenes de estudiantes en el panel de administración o en selectores de formularios, se implementó búsqueda indexada y paginación con límite:

### Consulta JPQL en `EstudianteRepository.java`
```java
@Query("SELECT e FROM Estudiante e LEFT JOIN e.usuario u WHERE " +
       "LOWER(e.nombres) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
       "LOWER(e.apellidos) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
       "LOWER(CONCAT(e.nombres, ' ', e.apellidos)) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
       "e.numeroDocumento LIKE CONCAT('%', :q, '%') OR " +
       "LOWER(u.correoInstitucional) LIKE LOWER(CONCAT('%', :q, '%'))")
List<Estudiante> buscarEstudiantes(@Param("q") String q, Pageable pageable);
```

### Endpoints Disponibles

#### A. Parámetros en el listado general (`AdminController.java`)
```http
GET /api/admin/estudiantes?search=1052&limit=20
```
- **`search` o `q`** (Opcional): Criterio de búsqueda (documento, nombres, apellidos o correo).
- **`limit`** (Opcional, por defecto `20`): Cantidad máxima de registros devueltos.
- Si no se envían parámetros, devuelve la lista completa preservando compatibilidad.

#### B. Endpoint dedicado para autocompletado en Angular
```http
GET /api/admin/estudiantes/buscar?q=jorge&limit=15
```
- Diseñado para componentes de tipo `typeahead` o `select` con búsqueda dinámica (por ejemplo, en el modal para matricular estudiantes en un curso).

---

## 6. Resumen de Endpoints Modificados y Nuevos

| Método | Endpoint | Rol Requerido | Descripción / Comportamiento |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/estudiantes` | `ADMIN` | Listado general; soporta parámetros `search` y `limit`. |
| `GET` | `/api/admin/estudiantes/buscar` | `ADMIN` | **Nuevo:** Búsqueda rápida con autocompletado (`q`, `limit`). |
| `GET` | `/api/admin/cursos` | `ADMIN` | Modificado: Retorna únicamente los cursos del **año actual**. |
| `GET` | `/api/admin/historial/cursos/{anio}` | `ADMIN` | **Nuevo:** Consulta histórica de cursos por año lectivo. |
| `PUT` | `/api/admin/cursos/{id}` | `ADMIN` | Modificado: Bloquea edición si el curso pertenece a un año anterior (HTTP 422). |
| `POST` | `/api/admin/matriculas` | `ADMIN` | Modificado: Valida que el año sea actual o `actual + 1` (HTTP 422 si no). |
| `GET` | `/api/admin/historial/matriculas/{anio}` | `ADMIN` | **Nuevo:** Consulta histórica de matrículas por año. |
| `GET` | `/api/admin/cargas-academicas` | `ADMIN` | Modificado: Retorna únicamente las cargas del **año actual**. |
| `GET` | `/api/admin/historial/cargas-academicas/{anio}` | `ADMIN` | **Nuevo:** Consulta histórica de cargas académicas por año lectivo. |
| `POST` | `/api/admin/cargas-academicas/{idCarga}/cortes` | `ADMIN` | Modificado: Suma 100%; `fechaInicioCalificacion` y `fechaFinCalificacion` son **opcionales**. |
| `GET` | `/api/docente/mis-cargas` | `DOCENTE` | Modificado: Retorna las cargas asignadas en el **año actual**. |
| `GET` | `/api/docente/historial/mis-cargas/{anio}` | `DOCENTE` | **Nuevo:** Cargas dictadas por el profesor en un año previo. |
| `GET` | `/api/docente/cargas/{idCarga}/calificaciones` | `DOCENTE` | **Nuevo:** Retorna todas las notas registradas para una carga académica. |
| `POST` | `/api/docente/calificaciones` | `DOCENTE` | Modificado: Bloquea con HTTP 422 si no hay fechas asignadas o si está fuera de rango. |
| `GET` | `/api/estudiante/mi-curso` | `ESTUDIANTE` | Modificado: Curso en el que está matriculado en el **año actual**. |
| `GET` | `/api/estudiante/mis-notas` | `ESTUDIANTE` | Modificado: Boletín de notas del **año actual**. |
| `GET` | `/api/estudiante/historial/mis-notas/{anio}` | `ESTUDIANTE` | **Nuevo:** Boletín de notas histórico por año lectivo. |

---

## 7. Pruebas Unitarias y de Integración

Se han añadido pruebas específicas que verifican estas reglas de negocio de forma automatizada:

1. **`BusinessLogicUnitTest`**:
   - `configurarCortes_SumaDiferenteDe100_LanzaExcepcion`: Suma de cortes $\neq 100\%$.
   - `eliminarDocente_ConCargasActivas_LanzaExcepcion`: Integridad de cargas en docentes.
   - `configurarCortes_FechasInvertidas_LanzaExcepcion`: Fechas cronológicamente incorrectas.
   - `crearMatricula_AnioInvalido_LanzaExcepcion`: Matrícula en años fuera de rango.
   - `buscarEstudiantes_ConCriterio_RetornaCoincidencias`: Búsqueda de estudiantes con límite.
   - `buscarEstudiantes_CriterioVacio_RetornaPaginados`: Búsqueda con criterio vacío.
2. **`DocenteServiceUnitTest`**:
   - `guardarCalificacion_VentanaFechasCerrada_LanzaExcepcion`: Intento de calificar fuera de la fecha permitida.
3. **`EstudianteServiceUnitTest`**:
   - `obtenerMisNotas_CalculoPromedioPonderado`: Boletín del año actual con ponderaciones.
   - `obtenerMisNotasHistorial_ConsultaAnioAnterior`: Boletín histórico de años previos.
4. **`BackendColegioApplicationTests`**:
   - Arranque del contexto de Spring Boot conectado a PostgreSQL.

**Resultado de ejecución (`./mvnw test`)**:
```text
[INFO] Tests run: 10, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

