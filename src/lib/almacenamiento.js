// Guardado en localStorage con UNA sola clave propia (STORAGE_KEY).
// Nunca se leen, se borran ni se pisan claves de otras aplicaciones
// (no se usa localStorage.clear()).
import { STORAGE_KEY, RESERVAS_EJEMPLO, TIPOS, INSTITUTO, DIAS_HABILES_A_MOSTRAR, FERIADOS } from '../data/config.js'
import { hoyEnZona, proximosDiasHabiles, diaSemana } from './fechas.js'
import { franjasDelTipo } from './disponibilidad.js'

const VERSION = 1

// ¿El navegador deja guardar? (modo privado estricto, almacenamiento lleno o bloqueado)
export function puedeGuardar() {
  try {
    const prueba = `${STORAGE_KEY}.__prueba`
    window.localStorage.setItem(prueba, '1')
    window.localStorage.removeItem(prueba)
    return true
  } catch {
    return false
  }
}

// Foto de los tipos y de las franjas de los próximos 10 días hábiles con sus
// lugares libres. Se guarda junto con las reservas para que todo el juego de
// datos se vea en localStorage. La fuente de verdad de tipos y horarios sigue
// siendo src/data/config.js: esta foto se recalcula cada vez que se abre la app.
export function fotoCatalogo(reservas, ahora = new Date()) {
  const hoy = hoyEnZona(INSTITUTO.zonaHoraria, ahora)
  const franjas = TIPOS.flatMap((tipo) =>
    franjasDelTipo(tipo, reservas, { hoy, cantidadDias: DIAS_HABILES_A_MOSTRAR, feriados: FERIADOS }).flatMap((d) =>
      d.franjas.map((f) => ({ tipoId: tipo.id, fecha: f.fecha, hora: f.hora, capacidad: f.capacidad, libres: f.libres })),
    ),
  )
  return { tipos: TIPOS, franjas }
}

// Convierte las reservas de ejemplo (con `dia` relativo) en reservas con fecha real.
export function construirEjemplo(ahora = new Date()) {
  const hoy = hoyEnZona(INSTITUTO.zonaHoraria, ahora)
  const dias = proximosDiasHabiles(hoy, DIAS_HABILES_A_MOSTRAR, FERIADOS)
  const reservas = RESERVAS_EJEMPLO.map((r) => {
    const tipo = TIPOS.find((t) => t.id === r.tipoId)
    const diasDelTipo = dias.filter((f) => tipo.diasSemana.includes(diaSemana(f)))
    const { dia, ...resto } = r
    return {
      ...resto,
      fecha: diasDelTipo[Math.min(dia, diasDelTipo.length - 1)],
      estado: 'activa',
      creadaEn: ahora.toISOString(),
      ejemplo: true,
    }
  })
  return { version: VERSION, ...fotoCatalogo(reservas, ahora), reservas, cargadoEn: ahora.toISOString() }
}

// Lee los datos. Si no hay nada (primera vez) o están rotos, carga el ejemplo.
export function cargar() {
  try {
    const crudo = window.localStorage.getItem(STORAGE_KEY)
    if (crudo) {
      const datos = JSON.parse(crudo)
      if (datos && datos.version === VERSION && Array.isArray(datos.reservas)) {
        const actualizados = { ...datos, ...fotoCatalogo(datos.reservas) }
        guardar(actualizados)
        return actualizados
      }
    }
  } catch {
    // sin acceso o JSON roto: seguimos con el ejemplo
  }
  const ejemplo = construirEjemplo()
  guardar(ejemplo)
  return ejemplo
}

// Devuelve true si se pudo guardar.
export function guardar(datos) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...datos, ...fotoCatalogo(datos.reservas) }))
    return true
  } catch {
    return false
  }
}

// Borra SOLO nuestra clave y vuelve a cargar el ejemplo.
export function restablecer() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignoramos: igual devolvemos el ejemplo en memoria
  }
  const ejemplo = construirEjemplo()
  guardar(ejemplo)
  return ejemplo
}
