// Pruebas automáticas de las reglas (sin navegador): `npm test`
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { TIPOS, EDAD_GENERAL, NIVELES, FERIADOS } from '../src/data/config.js'
import { proximosDiasHabiles, hoyEnZona, sumarMinutos } from '../src/lib/fechas.js'
import { franjasDelTipo, libresEnFranja, hayFranjasLibres, etiquetaLibres } from '../src/lib/disponibilidad.js'
import { validarFormulario, validarEdad } from '../src/lib/validacion.js'
import { generarICS } from '../src/lib/ics.js'
import { normalizarCodigo, generarCodigo } from '../src/lib/codigo.js'

const tipo = (id) => TIPOS.find((t) => t.id === id)
const r = (tipoId, fecha, hora, estado = 'activa') => ({ tipoId, fecha, hora, estado })

test('10 días hábiles: saltea fines de semana y feriados', () => {
  const dias = proximosDiasHabiles('2026-12-03', 10, FERIADOS) // jueves
  assert.equal(dias.length, 10)
  assert.equal(dias[0], '2026-12-04') // viernes
  assert.ok(!dias.includes('2026-12-05') && !dias.includes('2026-12-06')) // sábado y domingo
  assert.ok(!dias.includes('2026-12-08')) // feriado
  assert.equal(dias[2], '2026-12-09')
})

test('hoy se calcula en hora de Argentina', () => {
  // 02:00 UTC del 26 = 23:00 del 25 en Argentina
  assert.equal(hoyEnZona('America/Argentina/Buenos_Aires', new Date('2026-11-26T02:00:00Z')), '2026-11-25')
})

test('prueba de nivel y entrevista: 1 por franja', () => {
  const pn = tipo('prueba-nivel')
  assert.equal(libresEnFranja([], pn, '2026-12-01', '09:00'), 1)
  assert.equal(libresEnFranja([r('prueba-nivel', '2026-12-01', '09:00')], pn, '2026-12-01', '09:00'), 0)
  const en = tipo('entrevista-chicos')
  assert.equal(libresEnFranja([r('entrevista-chicos', '2026-12-01', '16:00')], en, '2026-12-01', '16:00'), 0)
})

test('clase de muestra usa su cupo grupal', () => {
  const cm = tipo('clase-muestra')
  const res = [1, 2, 3].map(() => r('clase-muestra', '2026-12-02', '18:30'))
  assert.equal(libresEnFranja(res, cm, '2026-12-02', '18:30'), cm.cupo - 3)
  res.push(r('clase-muestra', '2026-12-02', '18:30'))
  assert.equal(libresEnFranja(res, cm, '2026-12-02', '18:30'), 0)
})

test('no hay contador común: otro tipo en la misma hora no descuenta', () => {
  const cm = tipo('clase-muestra')
  const res = [r('prueba-nivel', '2026-12-02', '18:30'), r('entrevista-chicos', '2026-12-02', '18:30')]
  assert.equal(libresEnFranja(res, cm, '2026-12-02', '18:30'), cm.cupo)
})

test('cancelar libera el lugar', () => {
  const pn = tipo('prueba-nivel')
  assert.equal(libresEnFranja([r('prueba-nivel', '2026-12-01', '09:00', 'cancelada')], pn, '2026-12-01', '09:00'), 1)
})

test('franja sin lugares = Completo; sin franjas libres se detecta', () => {
  const en = tipo('entrevista-chicos')
  const hoy = '2026-11-25'
  const opts = { hoy, cantidadDias: 10, feriados: FERIADOS }
  const todas = franjasDelTipo(en, [], opts).flatMap((d) => d.franjas.map((f) => r(en.id, f.fecha, f.hora)))
  const dias = franjasDelTipo(en, todas, opts)
  assert.equal(etiquetaLibres(dias[0].franjas[0], en), 'Completo')
  assert.equal(hayFranjasLibres(dias), false)
})

test('edad: rango general y rango por tipo', () => {
  assert.match(validarEdad('5', tipo('entrevista-chicos'), EDAD_GENERAL), /entre 6 y 80/)
  assert.match(validarEdad('81', tipo('prueba-nivel'), EDAD_GENERAL), /entre 6 y 80/)
  assert.match(validarEdad('12', tipo('entrevista-chicos'), EDAD_GENERAL), /no corresponde/)
  assert.match(validarEdad('9', tipo('prueba-nivel'), EDAD_GENERAL), /no corresponde/)
  assert.equal(validarEdad('11', tipo('entrevista-chicos'), EDAD_GENERAL), null)
  assert.equal(validarEdad('6', tipo('entrevista-chicos'), EDAD_GENERAL), null)
  assert.equal(validarEdad('80', tipo('clase-muestra'), EDAD_GENERAL), null)
  assert.match(validarEdad('10.5', tipo('entrevista-chicos'), EDAD_GENERAL), /entero/)
})

test('formulario: nombre, email y nivel', () => {
  const base = { nombre: 'Ana', edad: '30', email: 'ana@mail.com', nivel: 'Básico' }
  assert.deepEqual(validarFormulario(base, tipo('prueba-nivel'), EDAD_GENERAL, NIVELES), {})
  assert.ok(validarFormulario({ ...base, nombre: 'A1 ' }, tipo('prueba-nivel'), EDAD_GENERAL, NIVELES).nombre)
  assert.ok(validarFormulario({ ...base, nombre: '  Al ' }, tipo('prueba-nivel'), EDAD_GENERAL, NIVELES).nombre)
  assert.ok(validarFormulario({ ...base, email: 'ana@mail' }, tipo('prueba-nivel'), EDAD_GENERAL, NIVELES).email)
  assert.ok(validarFormulario({ ...base, nivel: '' }, tipo('prueba-nivel'), EDAD_GENERAL, NIVELES).nivel)
})

test('.ics: fecha, hora y duración correctas', () => {
  const reserva = { codigo: 'ABC234', fecha: '2026-12-02', hora: '18:30', nombre: 'Ana' }
  const ics = generarICS(reserva, tipo('clase-muestra'), { nombre: 'Inst', direccion: 'Calle 1, MdP', zonaHoraria: 'America/Argentina/Buenos_Aires', offsetUTC: '-03:00' })
  assert.match(ics, /DTSTART;TZID=America\/Argentina\/Buenos_Aires:20261202T183000/)
  assert.match(ics, /DTEND;TZID=America\/Argentina\/Buenos_Aires:20261202T193000/) // 60 min
  assert.match(ics, /TZOFFSETTO:-0300/)
  assert.ok(ics.includes('\r\n'))
  const ics2 = generarICS({ ...reserva, hora: '16:30' }, tipo('entrevista-chicos'), { nombre: 'I', direccion: 'x', zonaHoraria: 'America/Argentina/Buenos_Aires', offsetUTC: '-03:00' })
  assert.match(ics2, /DTEND;TZID=[^:]+:20261202T165000/) // 20 min
  assert.deepEqual(sumarMinutos('2026-12-02', '23:50', 30), { fechaISO: '2026-12-03', hora: '00:20' })
})

test('código: normaliza y no repite', () => {
  assert.equal(normalizarCodigo(' k7q-m4p '), 'K7QM4P')
  const c = generarCodigo(new Set(['AAAAAA']))
  assert.match(c, /^[A-Z2-9]{6}$/)
})

test('.ics: ninguna línea supera 75 bytes', () => {
  const ics = generarICS({ codigo: 'ABC234', fecha: '2026-12-02', hora: '18:30', nombre: 'María José Ñañez Íñiguez de Álvarez Peña' }, tipo('clase-muestra'), { nombre: 'Instituto de Inglés del Barrio', direccion: 'Calle Ejemplo 1234, Mar del Plata', zonaHoraria: 'America/Argentina/Buenos_Aires', offsetUTC: '-03:00' })
  for (const l of ics.split('\r\n')) assert.ok(new TextEncoder().encode(l).length <= 75, l)
  assert.ok(ics.replace(/\r\n /g, '').includes('María José Ñañez Íñiguez de Álvarez Peña'))
})
