// Manejo de fechas sin depender de la zona horaria del celular:
// todas las fechas son textos 'AAAA-MM-DD' en hora del instituto.

const pad = (n) => String(n).padStart(2, '0')

// Fecha de hoy en la zona horaria del instituto ('AAAA-MM-DD').
export function hoyEnZona(zonaHoraria, ahora = new Date()) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: zonaHoraria,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(ahora)
  const get = (t) => partes.find((p) => p.type === t).value
  return `${get('year')}-${get('month')}-${get('day')}`
}

export function sumarDias(fechaISO, dias) {
  const [y, m, d] = fechaISO.split('-').map(Number)
  const f = new Date(Date.UTC(y, m - 1, d + dias))
  return `${f.getUTCFullYear()}-${pad(f.getUTCMonth() + 1)}-${pad(f.getUTCDate())}`
}

// 1 = lunes … 7 = domingo
export function diaSemana(fechaISO) {
  const [y, m, d] = fechaISO.split('-').map(Number)
  const n = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  return n === 0 ? 7 : n
}

export function esHabil(fechaISO, feriados = []) {
  return diaSemana(fechaISO) <= 5 && !feriados.includes(fechaISO)
}

// Próximos N días hábiles empezando MAÑANA (hoy no se ofrece).
export function proximosDiasHabiles(hoyISO, cantidad, feriados = []) {
  const dias = []
  let f = hoyISO
  while (dias.length < cantidad) {
    f = sumarDias(f, 1)
    if (esHabil(f, feriados)) dias.push(f)
  }
  return dias
}

// Suma minutos a 'HH:MM' → { fechaISO, hora } (por si cruza la medianoche).
export function sumarMinutos(fechaISO, hora, minutos) {
  const [h, mi] = hora.split(':').map(Number)
  const total = h * 60 + mi + minutos
  const diasExtra = Math.floor(total / 1440)
  const resto = total % 1440
  return {
    fechaISO: sumarDias(fechaISO, diasExtra),
    hora: `${pad(Math.floor(resto / 60))}:${pad(resto % 60)}`,
  }
}

const DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

// 'jueves 26 de noviembre'
export function fechaLarga(fechaISO) {
  const [, m, d] = fechaISO.split('-').map(Number)
  return `${DIAS[diaSemana(fechaISO) - 1]} ${d} de ${MESES[m - 1]}`
}

export function capitalizar(t) {
  return t.charAt(0).toUpperCase() + t.slice(1)
}
