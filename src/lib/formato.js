import { fechaLarga, sumarMinutos } from './fechas.js'

export function precioTexto(precio) {
  if (!precio) return 'Sin cargo'
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(precio)
}

export function capacidadTexto(tipo) {
  return tipo.unidad === 'persona' ? 'Cupo: 1 persona por horario' : `Cupo: ${tipo.cupo} personas por clase`
}

export function horarioTexto(reserva, tipo) {
  const fin = sumarMinutos(reserva.fecha, reserva.hora, tipo.duracionMin)
  return `${reserva.hora} a ${fin.hora} hs`
}

export function textoWhatsApp(reserva, tipo, instituto) {
  return (
    `¡Reservé mi turno en ${instituto.nombre}! ` +
    `${tipo.nombre}, el ${fechaLarga(reserva.fecha)} de ${horarioTexto(reserva, tipo)} (${tipo.duracionMin} min). ` +
    `Lugar: ${instituto.direccion}. Código de turno: ${reserva.codigo}.`
  )
}

export function urlWhatsApp(reserva, tipo, instituto) {
  return `https://wa.me/?text=${encodeURIComponent(textoWhatsApp(reserva, tipo, instituto))}`
}
