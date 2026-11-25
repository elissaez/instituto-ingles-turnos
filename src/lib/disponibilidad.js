// REGLA «unidad de capacidad por propuesta»:
// cada tipo de turno tiene su propia capacidad por franja.
//  - Prueba de nivel y entrevista (unidad 'persona'): 1 reserva por franja.
//  - Clase de muestra (unidad 'grupo'): `cupo` reservas por franja.
// Los lugares libres se cuentan SOLO con las reservas activas del mismo
// tipo, mismo día y misma hora. No hay un contador común entre tipos.

import { proximosDiasHabiles, diaSemana } from './fechas.js'

export function capacidadDe(tipo) {
  return tipo.unidad === 'persona' ? 1 : tipo.cupo
}

export function claveFranja(tipoId, fecha, hora) {
  return `${tipoId}|${fecha}|${hora}`
}

export function ocupados(reservas, tipoId, fecha, hora) {
  return reservas.filter(
    (r) => r.estado === 'activa' && r.tipoId === tipoId && r.fecha === fecha && r.hora === hora,
  ).length
}

export function libresEnFranja(reservas, tipo, fecha, hora) {
  return Math.max(0, capacidadDe(tipo) - ocupados(reservas, tipo.id, fecha, hora))
}

// Días (hábiles y en que el tipo trabaja) con sus franjas y lugares libres.
export function franjasDelTipo(tipo, reservas, { hoy, cantidadDias, feriados }) {
  return proximosDiasHabiles(hoy, cantidadDias, feriados)
    .filter((fecha) => tipo.diasSemana.includes(diaSemana(fecha)))
    .map((fecha) => ({
      fecha,
      franjas: tipo.horarios.map((hora) => {
        const libres = libresEnFranja(reservas, tipo, fecha, hora)
        return { fecha, hora, libres, capacidad: capacidadDe(tipo), completo: libres === 0 }
      }),
    }))
}

export function hayFranjasLibres(dias) {
  return dias.some((d) => d.franjas.some((f) => !f.completo))
}

export function etiquetaLibres(franja, tipo) {
  if (franja.completo) return 'Completo'
  if (tipo.unidad === 'persona') return 'Libre'
  return franja.libres === 1 ? '1 lugar libre' : `${franja.libres} lugares libres`
}
