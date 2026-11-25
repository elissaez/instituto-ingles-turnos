# Turnos · Instituto de Inglés (Mar del Plata)

Página de dos pantallas para que quien quiere empezar inglés reserve un turno de **prueba de nivel**, **entrevista para chicos** o un lugar en una **clase de muestra de conversación**. Muestra los horarios libres de los próximos 10 días hábiles y confirma el turno en el momento con un código corto.

- **Turnos**: elegís tipo → día y horario → tus datos → «Reservar».
- **Mi turno**: buscás por código, ves el detalle, cancelás (con confirmación), descargás el `.ics` o lo compartís por WhatsApp.

Stack: **React 18 + Vite 5 + Tailwind CSS 3**, sin backend. Todo se guarda en `localStorage`. Todos los datos son sintéticos.

---

## Cómo correrlo localmente

Necesitás Node.js 18 o más nuevo.

```bash
npm install
npm run dev        # abre http://localhost:5173
npm test           # pruebas automáticas de las reglas (node --test)
npm run build      # versión de producción en dist/
npm run preview    # sirve dist/ en http://localhost:4173
```

### Importar en Lovable

Lovable trabaja con proyectos React + Vite + Tailwind como este. Subí la carpeta a un repositorio de GitHub y conectalo desde Lovable (*Settings → GitHub*), o pegá los archivos de `src/` en un proyecto Lovable nuevo. No hay dependencias además de React y Tailwind.

## URL de previsualización

- **Vista previa: https://elissaez.github.io/instituto-ingles-turnos/**
- Se publica sola con GitHub Actions (`.github/workflows/deploy.yml`) cada vez que se sube algo a `main`: instala, corre `npm test`, arma `dist/` y lo publica en GitHub Pages. Si las pruebas fallan, no se publica.
- Localmente: `npm run dev` o `npm run preview`.

---

## Estructura

```
src/
  data/config.js            ← ARCHIVO DE DATOS (tipos, franjas, cupos, edades, feriados, reservas de ejemplo)
  lib/
    almacenamiento.js       ← lectura/escritura de localStorage con la clave propia
    disponibilidad.js       ← regla de cupo por tipo de turno
    validacion.js           ← validaciones del formulario
    fechas.js               ← días hábiles, zona horaria, formatos de fecha
    ics.js                  ← armado y descarga del archivo .ics
    codigo.js               ← código corto de turno
    formato.js              ← precios, textos, link de WhatsApp
  components/
    PantallaTurnos.jsx      ← pantalla 1
    PantallaMiTurno.jsx     ← pantalla 2
    DetalleTurno.jsx        ← detalle compartido + botones .ics / WhatsApp
  App.jsx                   ← encabezado, navegación, aviso de guardado, restablecer
tests/reglas.test.js        ← pruebas automáticas
docs/capturas/              ← capturas a 360 px de la verificación
```

---

## Cambiar tipos de turno, franjas, cupos y edades

Todo está en **`src/data/config.js`**. No hace falta tocar otro archivo.

Cada tipo en `TIPOS` tiene:

| Campo | Qué es | Ejemplo |
|---|---|---|
| `id` | identificador interno (no cambiarlo si ya hay reservas guardadas) | `'prueba-nivel'` |
| `nombre`, `destinatarios`, `descripcion` | textos que ve la persona | |
| `duracionMin` | duración en minutos. También define el fin del evento en el `.ics` | `30` |
| `precio` | en pesos; `0` muestra «Sin cargo» | `5000` |
| `unidad` | `'persona'` = 1 reserva por franja · `'grupo'` = usa `cupo` | `'grupo'` |
| `cupo` | lugares por franja (solo cuenta en `'grupo'`) | `4` |
| `edad` | rango permitido para ese tipo | `{ min: 6, max: 11 }` |
| `diasSemana` | días en que hay franjas (1 = lunes … 5 = viernes) | `[1, 3, 5]` |
| `horarios` | hora de inicio de cada franja (hora del instituto) | `['18:30', '19:30']` |

Otros valores del mismo archivo:

- `EDAD_GENERAL` – rango general del formulario (6 a 80).
- `DIAS_HABILES_A_MOSTRAR` – cantidad de días hábiles (10), empezando mañana.
- `FERIADOS` – fechas sin atención; se saltean igual que sábados y domingos.
- `NIVELES` – opciones de «nivel que creés tener».
- `INSTITUTO` – nombre, dirección y zona horaria (se usan en pantalla, en el `.ics` y en WhatsApp).

Valores actuales:

| Tipo | Duración | Precio | Capacidad por franja | Edad | Días | Horarios |
|---|---|---|---|---|---|---|
| Prueba de nivel (adultos y adolescentes) | 30 min | Sin cargo | 1 persona | 12–80 | lun a vie | 9:00, 9:30, 10:00, 17:00, 17:30, 18:00 |
| Entrevista para chicos | 20 min | Sin cargo | 1 persona | 6–11 | lun a vie | 16:00, 16:30, 17:00 |
| Clase de muestra de conversación | 60 min | $ 5.000 | grupo de 4 | 12–80 | lun, mié, vie | 18:30, 19:30 |

> Si cambiás un `cupo` o un horario, las reservas ya guardadas en el navegador siguen ahí. Para empezar de cero tocá «Restablecer datos de ejemplo».

## Preparar y reemplazar los datos de ejemplo

Las reservas de ejemplo están en `RESERVAS_EJEMPLO` (en `src/data/config.js`). En vez de una fecha fija cada una tiene `dia`: la posición entre los días en que **ese tipo** tiene franjas (0 = el primero). Así siempre caen en fechas futuras, abras la app el día que la abras.

```js
{ codigo: 'K7QM4P', tipoId: 'prueba-nivel', dia: 0, hora: '09:00',
  nombre: 'Lucía Fernández', edad: 34, email: 'lucia.fernandez@ejemplo.com', nivel: 'Básico' }
```

Las seis reservas de ejemplo:

| Código | Tipo | Día | Hora | Qué muestra |
|---|---|---|---|---|
| K7QM4P | Prueba de nivel | 1.er día | 09:00 | franja de prueba de nivel **ya tomada** |
| HT3WZ8, R9DXA2, BN5UCE, PV2LJ6 | Clase de muestra | 1.er día de clase | 18:30 | clase **completa** (4 de 4) |
| MF8YS3 | Clase de muestra | 2.º día de clase | 18:30 | clase con **3 lugares libres** |

Para reemplazarlas: editá la lista (respetá que `hora` sea uno de los `horarios` del tipo y que el `codigo` sea único, 6 caracteres) y después tocá «Restablecer datos de ejemplo» en la app, o borrá la clave en las herramientas del navegador.

## Botón «Restablecer datos de ejemplo»

Está al pie de las dos pantallas. Pide confirmación dentro de la página y después:

1. borra **solo** la clave propia de la app (`localStorage.removeItem(STORAGE_KEY)`),
2. vuelve a armar las seis reservas de ejemplo con fechas relativas a hoy,
3. las guarda y muestra «Listo: se volvieron a cargar los datos de ejemplo».

Se pierden las reservas de prueba que hayas hecho en ese navegador.

## Almacenamiento: clave propia

- La app usa **una sola clave**: `kodarvia.instituto-ingles.turnos.v1` (constante `STORAGE_KEY`).
- Guarda ahí un JSON `{ version, reservas, cargadoEn }`.
- **No lee, no borra ni pisa claves de otras aplicaciones.** Nunca usa `localStorage.clear()`. Esto está verificado en la prueba manual (una clave `otra-app` sobrevive al restablecer).
- Para comprobar si el navegador deja guardar, escribe y borra al instante `kodarvia.instituto-ingles.turnos.v1.__prueba`.
- Si el navegador **no deja guardar** (modo incógnito estricto, almacenamiento bloqueado o lleno), aparece arriba un aviso amarillo: se puede reservar igual, pero el turno se pierde al recargar, y se pide anotar el código.
- Si el JSON guardado está roto o es de otra versión, se cargan los datos de ejemplo.
- Al reservar y al cancelar se vuelve a leer lo guardado antes de escribir, por si otra pestaña cambió algo. Si la franja se completó mientras tanto, se avisa «Ese horario se completó recién».

## Cómo se arma el archivo `.ics`

Lo hace `src/lib/ics.js` (función `generarICS`), siguiendo el estándar de calendarios RFC 5545:

- `DTSTART;TZID=America/Argentina/Buenos_Aires:AAAAMMDDTHHMMSS` con la fecha y hora de la franja **en hora del instituto**.
- `DTEND` = inicio + `duracionMin` del tipo (si cruza la medianoche pasa al día siguiente).
- Incluye un bloque `VTIMEZONE` (UTC−3, Argentina no tiene horario de verano), así Google Calendar, Apple y Outlook lo muestran bien aunque el teléfono esté en otra zona.
- `UID` = `<código>@turnos-instituto-ingles`, `SUMMARY` con tipo e instituto, `DESCRIPTION` con nombre, código y duración, `LOCATION` con la dirección.
- Escapa comas, punto y coma y saltos de línea; corta las líneas largas a 75 bytes; usa saltos `CRLF`.
- Se descarga como `turno-<CÓDIGO>.ics` (Blob + link temporal).

Ejemplo real descargado en la prueba guiada (entrevista del jueves 26/11/2026 a las 16:00, 20 min):

```
DTSTART;TZID=America/Argentina/Buenos_Aires:20261126T160000
DTEND;TZID=America/Argentina/Buenos_Aires:20261126T162000
SUMMARY:Entrevista para chicos – Instituto de Inglés del Barrio
```

## Compartir por WhatsApp

Abre `https://wa.me/?text=…` con un texto armado en `src/lib/formato.js`: tipo, día, horario, duración, dirección y código. La persona elige a quién mandarlo.

---

## Reglas y pruebas

### Modelo de datos

**Tipo de turno** (en `config.js`, no se guarda): `id, nombre, duracionMin, precio, unidad ('persona' | 'grupo'), cupo, edad {min,max}, diasSemana[], horarios[]`.

**Franja** (se calcula, no se guarda): `{ tipoId, fecha 'AAAA-MM-DD', hora 'HH:MM' }`. Las franjas de un tipo son: próximos 10 días hábiles (desde mañana, sin fines de semana ni feriados) ∩ `diasSemana` del tipo × `horarios` del tipo.

**Reserva** (se guarda en `localStorage`):

```js
{
  codigo: 'QEWX3Q',            // 6 caracteres, sin 0/O/1/I/L
  tipoId: 'entrevista-chicos',
  fecha: '2026-11-26', hora: '16:00',
  nombre: 'Valentina Ruiz', edad: 9, email: 'familia.ruiz@ejemplo.com', nivel: 'Básico',
  estado: 'activa' | 'cancelada',
  creadaEn: '…ISO…', canceladaEn?: '…ISO…', ejemplo?: true
}
```

Cancelar no borra la reserva: la marca `cancelada` (así el código sigue mostrando «Cancelado») y deja de contar para el cupo.

### Regla «unidad de capacidad por propuesta»

Cada propuesta (tipo de turno) tiene **su propia unidad de capacidad**:

- **Prueba de nivel** y **entrevista**: unidad `persona` → capacidad **1 por franja**. Una reserva y la franja queda «Completo». Se muestra «Libre» o «Completo».
- **Clase de muestra**: unidad `grupo` → capacidad = `cupo` (4). Se muestra «N lugares libres», «1 lugar libre» o «Completo».

```
libres(tipo, fecha, hora) = capacidad(tipo) − reservas ACTIVAS con ese mismo tipoId, fecha y hora
capacidad(tipo) = 1 si unidad = 'persona'; cupo si unidad = 'grupo'
```

La disponibilidad **se calcula por tipo, no con un contador común**: una prueba de nivel a las 18:00 no descuenta lugares de una clase de muestra, aunque coincidan día y hora. Código: `src/lib/disponibilidad.js`.

Otras reglas:

- Una franja con 0 libres aparece **«Completo»**, tachada y deshabilitada (no se puede elegir).
- Si un tipo no tiene ninguna franja libre en los 10 días, se muestra: «No quedan horarios libres en los próximos 10 días hábiles para …».
- **Edad**: primero se valida el rango general 6–80 y después el rango del tipo. Si no corresponde, aparece el aviso al escribirla y el botón «Reservar» queda deshabilitado.
- **Cambiar el tipo revalida edad y franja**: se borra la franja elegida (las franjas son de cada tipo), aparece «Cambiaste el tipo de turno: elegí de nuevo el día y el horario» y, si la edad ya no corresponde, «Revisá la edad: no corresponde al nuevo tipo».
- Nombre: mínimo 3 letras (se cuentan solo letras, con tildes y ñ). Email: formato `algo@dominio.ext`. Nivel: obligatorio.
- No se permite reservar dos veces la misma franja con el mismo nombre y email.

### Prueba guiada (datos y resultado observado)

Hecha el **25/11/2026** sobre la versión de producción (`npm run build` + `npm run preview`) en Chromium con pantalla de **360 × 740 px**, con los datos de ejemplo recién cargados. Días hábiles mostrados: 26/11 al 10/12 (se saltea el feriado del 8/12).

| # | Paso | Datos | Resultado observado |
|---|---|---|---|
| 1 | Abrir por primera vez | — | 6 reservas cargadas. Clase de muestra vie 27/11 18:30 «Completo» y deshabilitada; lun 30/11 18:30 «3 lugares libres»; prueba de nivel jue 26/11 09:00 «Completo». ✅ |
| 2 | Elegir «Entrevista para chicos» | — | Jue 26/11 16:00 muestra «Libre». ✅ |
| 3 | Elegir esa franja y completar | Valentina Ruiz · 9 · familia.ruiz@ejemplo.com · Básico | Resumen «Entrevista para chicos · Jueves 26 de noviembre a las 16:00». ✅ |
| 4 | **Cambiar el tipo** a Prueba de nivel | edad 9 | La franja se borra, aviso «elegí de nuevo el día y el horario» + «Revisá la edad», error «Con 9 años no corresponde «Prueba de nivel» (es para 12 a 80 años)», «Reservar» deshabilitado. ✅ |
| 5 | Volver a Entrevista | edad 9 | Edad válida otra vez; sigue sin dejar reservar hasta elegir franja. ✅ |
| 6 | Edad fuera del tipo | 12 con Entrevista | Aviso de rango 6–11 y «Reservar» deshabilitado. ✅ |
| 7 | Edad fuera del rango general | 5 | «La edad tiene que estar entre 6 y 80 años.» ✅ |
| 8 | Nombre y email inválidos | «Al» · familia@ejemplo | Errores «mínimo 3 letras» y «formato no es válido»; no se reserva. ✅ |
| 9 | **Reservar la última (única) entrevista de la franja** | datos del paso 3 | Código `QEWX3Q`; se guardan 7 reservas en la clave propia. ✅ |
| 10 | Volver a ver franjas | — | Entrevista jue 26/11 16:00 **«Completo»** y deshabilitada. La clase de muestra **distinta** lun 30/11 18:30 **conserva «3 lugares libres»** (y las demás clases siguen en 4). ✅ |
| 11 | Mi turno con código inexistente | ZZZZZZ | «No encontramos ningún turno con el código «ZZZZZZ»…». ✅ |
| 12 | Mi turno con el código | « qew-x3q » (minúsculas, guion, espacios) | Encuentra el turno y muestra el detalle. ✅ |
| 13 | Descargar `.ics` | — | `turno-QEWX3Q.ics`: DTSTART 20261126T160000, DTEND 20261126T162000 (20 min), zona America/Argentina/Buenos_Aires. ✅ |
| 14 | Compartir por WhatsApp | — | Link `https://wa.me/?text=…` con tipo, día, horario y código. ✅ |
| 15 | Cancelar turno → confirmar | — | Estado «Cancelado» y mensaje «El lugar ya quedó libre». ✅ |
| 16 | Volver a Turnos → Entrevista | — | Jue 26/11 16:00 vuelve a «Libre». ✅ |
| 17 | Restablecer datos de ejemplo | otra clave `otra-app` guardada antes | Vuelven las 6 reservas; `otra-app` sigue intacta. ✅ |
| 18 | Sin franjas libres | se ocupan las 30 entrevistas de los 10 días | Mensaje «No quedan horarios libres en los próximos 10 días hábiles…». La clase de muestra sigue con franjas (no comparte contador). ✅ |
| 19 | Navegador que no deja guardar | `setItem` bloqueado | Aviso «Tu navegador no deja guardar datos…» arriba. ✅ |
| 20 | 360 px | todas las pantallas | Sin scroll horizontal en ninguna pantalla; sin errores en consola. ✅ |

Resultado: **37 de 37 comprobaciones OK** en la corrida automatizada en navegador, y **12 de 12** pruebas de reglas con `npm test`. Capturas en `docs/capturas/`.

### Verificación manual (para repetir a mano)

1. Abrí la app en una ventana normal y achicá el navegador a 360 px (DevTools → modo dispositivo → 360 de ancho).
2. Tocá «Restablecer datos de ejemplo» → «Sí, restablecer».
3. **Clase de muestra**: el primer día con clase a las 18:30 dice «Completo» y no se puede tocar; el segundo día a las 18:30 dice «3 lugares libres».
4. **Prueba de nivel**: el primer día a las 09:00 dice «Completo».
5. **Entrevista para chicos**: elegí el primer horario «Libre», completá nombre, edad 9, email y nivel.
6. Cambiá a «Prueba de nivel»: tiene que desaparecer la franja elegida y aparecer el aviso de edad. Volvé a «Entrevista».
7. Probá edad 12 (aviso, botón gris) y después 9. Probá nombre «Al» y email sin «.com» (errores al tocar Reservar).
8. Corregí y tocá «Reservar». Anotá el código.
9. «Reservar otro turno» → Entrevista: esa franja ahora dice «Completo». Clase de muestra: el segundo día 18:30 sigue con «3 lugares libres».
10. «Mi turno»: buscá `ZZZZZZ` (aviso) y después tu código. Descargá el `.ics` y abrilo con un editor de texto o el calendario: revisá día, hora de inicio y fin.
11. Tocá «Compartir por WhatsApp»: se abre WhatsApp con el texto.
12. «Cancelar turno» → «Sí, cancelar turno». Volvé a Turnos → Entrevista: el horario está «Libre» otra vez.
13. Abrí la app en una ventana de incógnito de Safari (o bloqueá el almacenamiento del sitio): tiene que aparecer el aviso amarillo.

---

## Lo que queda para Kodarvia

Backend y base de datos reales, envío de mails de confirmación, cobro de la clase de muestra, dominio, políticas legales, textos definitivos del instituto y puesta en producción. La lógica de reglas (`src/lib/disponibilidad.js`, `validacion.js`, `ics.js`) no depende de React y se puede reutilizar del lado del servidor.
