# DECISIONS.md — Decisiones Técnicas

## 1. ¿Cómo modelaste la relación entre sensores y zonas y por qué?

La relación entre sensores y zonas es **muchos a muchos (M:N)**, ya que un sensor puede monitorear varias zonas y una zona puede tener varios sensores activos.

Se implementó mediante una **tabla de unión con atributos propios** llamada `monitorings`. Esta tabla no es simplemente una tabla pivot con dos claves foráneas: tiene columnas propias (`install_date`, `reading_type`, `threshold_value`, `status`) que describen *cómo* ocurre esa relación específica, no el sensor ni la zona por separado.

Esta decisión sigue el patrón de **entidad de asociación** (también llamado tabla intermedia o join table con atributos), que es la forma correcta de modelar relaciones M:N con datos propios en SQL relacional. Se añadió una restricción `UNIQUE(sensor_id, zone_id)` para evitar asignaciones duplicadas.

---

## 2. ¿Qué validación o restricción consideras más importante en tu solución y por qué?

La restricción más importante es **`UNIQUE(sensor_id, zone_id)` en la tabla `monitorings`**.

En un sistema de monitoreo industrial, tener el mismo sensor asignado dos veces a la misma zona generaría lecturas duplicadas, alertas erróneas y datos inconsistentes que podrían provocar decisiones incorrectas en planta. Esta restricción garantiza la integridad del sistema a nivel de base de datos, no solo a nivel de aplicación, lo que la hace robusta frente a cualquier acceso directo a la BD.

Como segunda restricción relevante: el `CHECK` en `threshold_value > 0`, ya que un umbral de 0 o negativo no tiene sentido físico en sensores industriales (temperatura, presión, vibración o flujo siempre tienen valores positivos reales).

---

## 3. ¿Cómo organizaste la estructura de tu backend y por qué?

Se adoptó una **arquitectura de tres capas** clásica:

```
src/
├── types/         → Interfaces y tipos TypeScript del dominio
├── db/            → Conexión y configuración de la base de datos
├── services/      → Lógica de negocio y consultas SQL
├── controllers/   → Manejo de requests/responses HTTP
├── routes/        → Definición de rutas y enlace con controladores
└── middleware/    → Manejo global de errores y rutas no encontradas
```

**¿Por qué esta organización?**
- **Separación de responsabilidades**: cada capa tiene una única razón para cambiar. Si cambia la BD, solo se toca el servicio. Si cambia la API, solo se toca el controlador.
- **Testabilidad**: los servicios pueden probarse de forma aislada sin levantar el servidor.
- **Escalabilidad**: agregar nuevas entidades (ej. alertas, usuarios) solo requiere añadir archivos en las carpetas existentes sin modificar lo que ya funciona.
- **Tipos separados**: los tipos e interfaces en `/types` evitan duplicación y sirven como contrato compartido entre capas.

---

## 4. Si tuvieras un día adicional, ¿qué mejorarías primero y por qué?

Implementaría **validación de esquema con Zod en los endpoints** y un sistema básico de **historial de lecturas** (`readings`).

**¿Por qué validación con Zod?** Actualmente las validaciones están dispersas en los controladores con condicionales manuales. Zod permitiría definir el esquema esperado de cada request en un solo lugar, con mensajes de error automáticos, precisos y tipados. Esto reduciría el código repetitivo y haría la API más robusta.

**¿Por qué historial de lecturas?** El sistema actual almacena la *configuración* del monitoreo pero no los *valores reales* medidos por los sensores. Sin un historial de lecturas no es posible mostrar si un sensor supera el umbral en tiempo real, ni generar alertas, ni hacer análisis histórico — funcionalidades críticas para una planta industrial real.

Mientras tanto, el frontend usa una función determinística (`getSimulatedReading`) para generar valores de demostración consistentes y poder mostrar alertas de umbral sin depender de datos aleatorios en cada recarga.

---

## Stack tecnológico

| Capa       | Tecnología                          | Razón de elección                                      |
|------------|-------------------------------------|--------------------------------------------------------|
| Backend    | Node.js + Express + TypeScript      | Ecosistema amplio, tipado estático, desarrollo ágil    |
| Base datos | SQLite + better-sqlite3             | Sin instalación de servidor, perfecto para prueba técnica |
| Frontend   | React + TypeScript + Vite           | Componentes reutilizables, build rápido                |
| Estilos    | Tailwind CSS                        | Utilidades inline, consistencia visual, sin CSS extra  |
