// Arma un archivo .ics (calendario) con el turno.
// Usa la zona horaria del instituto (TZID) con su definición VTIMEZONE,
// así Google Calendar, Apple y Outlook muestran la hora correcta
// aunque el celular esté en otra zona.
import { sumarMinutos } from './fechas.js'

const CRLF = '\r\n'

function escapar(texto) {
  return String(texto)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

// Corta líneas largas a 75 bytes como pide el estándar (RFC 5545).
// Se cuentan bytes UTF-8 (una «á» ocupa 2) y nunca se corta una letra al medio.
const enc = new TextEncoder()
function plegar(linea) {
  const partes = []
  let actual = ''
  let bytes = 0
  for (const ch of linea) {
    const b = enc.encode(ch).length
    const limite = partes.length === 0 ? 75 : 74 // las siguientes llevan un espacio adelante
    if (bytes + b > limite) {
      partes.push(actual)
      actual = ''
      bytes = 0
    }
    actual += ch
    bytes += b
  }
  partes.push(actual)
  return partes.map((p, i) => (i === 0 ? p : ' ' + p)).join(CRLF)
}

const aIcsLocal = (fechaISO, hora) => `${fechaISO.replace(/-/g, '')}T${hora.replace(':', '')}00`

function aIcsUTC(fecha) {
  return fecha.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

// offset '-03:00' → '-0300'
const offsetCompacto = (o) => o.replace(':', '')

export function generarICS(reserva, tipo, instituto, ahora = new Date()) {
  const fin = sumarMinutos(reserva.fecha, reserva.hora, tipo.duracionMin)
  const tz = instituto.zonaHoraria
  const off = offsetCompacto(instituto.offsetUTC)
  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kodarvia//Turnos Instituto de Ingles//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VTIMEZONE',
    `TZID:${tz}`,
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    `TZOFFSETFROM:${off}`,
    `TZOFFSETTO:${off}`,
    `TZNAME:${instituto.offsetUTC.slice(0, 3)}`,
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${reserva.codigo}@turnos-instituto-ingles`,
    `DTSTAMP:${aIcsUTC(ahora)}`,
    `DTSTART;TZID=${tz}:${aIcsLocal(reserva.fecha, reserva.hora)}`,
    `DTEND;TZID=${tz}:${aIcsLocal(fin.fechaISO, fin.hora)}`,
    `SUMMARY:${escapar(`${tipo.nombre} – ${instituto.nombre}`)}`,
    `DESCRIPTION:${escapar(`Turno para ${reserva.nombre}. Código: ${reserva.codigo}. Duración: ${tipo.duracionMin} minutos.`)}`,
    `LOCATION:${escapar(instituto.direccion)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lineas.map(plegar).join(CRLF) + CRLF
}

export function descargarICS(reserva, tipo, instituto) {
  const contenido = generarICS(reserva, tipo, instituto)
  const blob = new Blob([contenido], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `turno-${reserva.codigo}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
