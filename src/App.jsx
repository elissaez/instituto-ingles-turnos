import { useEffect, useState } from 'react'
import { INSTITUTO, TIPOS } from './data/config.js'
import { cargar, guardar, puedeGuardar, restablecer, construirEjemplo } from './lib/almacenamiento.js'
import { libresEnFranja } from './lib/disponibilidad.js'
import { generarCodigo } from './lib/codigo.js'
import PantallaTurnos from './components/PantallaTurnos.jsx'
import PantallaMiTurno from './components/PantallaMiTurno.jsx'

// Navegación simple por hash: #turnos o #mi-turno (sin librería de rutas).
function leerPantalla() {
  return (window.location.hash || '').replace(/^#\/?/, '').startsWith('mi-turno') ? 'mi-turno' : 'turnos'
}

export default function App() {
  const [almacenamientoOk] = useState(() => puedeGuardar())
  const [datos, setDatos] = useState(() => (almacenamientoOk ? cargar() : construirEjemplo()))
  const [pantalla, setPantalla] = useState(leerPantalla)
  const [codigoParaVer, setCodigoParaVer] = useState('')
  const [confirmarReset, setConfirmarReset] = useState(false)
  const [avisoReset, setAvisoReset] = useState('')

  useEffect(() => {
    const alCambiar = () => setPantalla(leerPantalla())
    window.addEventListener('hashchange', alCambiar)
    return () => window.removeEventListener('hashchange', alCambiar)
  }, [])

  const ir = (destino, codigo = '') => {
    setCodigoParaVer(codigo)
    setPantalla(destino)
    window.location.hash = destino
    window.scrollTo(0, 0)
  }

  // Guarda y avisa si falló (el estado en memoria se actualiza igual).
  const persistir = (nuevos) => {
    setDatos(nuevos)
    return almacenamientoOk ? guardar(nuevos) : false
  }

  // Reserva: se vuelve a leer lo guardado por si otra pestaña reservó mientras tanto.
  const reservar = ({ tipoId, fecha, hora, nombre, edad, email, nivel }) => {
    const actuales = almacenamientoOk ? cargar() : datos
    const tipo = TIPOS.find((t) => t.id === tipoId)
    if (libresEnFranja(actuales.reservas, tipo, fecha, hora) <= 0) {
      setDatos(actuales)
      return { ok: false, error: 'Ese horario se completó recién. Elegí otro, por favor.' }
    }
    const duplicada = actuales.reservas.some(
      (r) => r.estado === 'activa' && r.tipoId === tipoId && r.fecha === fecha && r.hora === hora && r.email.toLowerCase() === email.toLowerCase() && r.nombre.toLowerCase() === nombre.toLowerCase(),
    )
    if (duplicada) return { ok: false, error: 'Ya hay un turno a ese nombre y email en este mismo horario.' }
    const codigo = generarCodigo(new Set(actuales.reservas.map((r) => r.codigo)))
    const reserva = { codigo, tipoId, fecha, hora, nombre, edad, email, nivel, estado: 'activa', creadaEn: new Date().toISOString() }
    const guardado = persistir({ ...actuales, reservas: [...actuales.reservas, reserva] })
    return { ok: true, reserva, guardado }
  }

  const cancelar = (codigo) => {
    const actuales = almacenamientoOk ? cargar() : datos
    const reservas = actuales.reservas.map((r) => (r.codigo === codigo ? { ...r, estado: 'cancelada', canceladaEn: new Date().toISOString() } : r))
    return persistir({ ...actuales, reservas })
  }

  const hacerReset = () => {
    setDatos(almacenamientoOk ? restablecer() : construirEjemplo())
    setConfirmarReset(false)
    setAvisoReset('Listo: se volvieron a cargar los datos de ejemplo.')
    setTimeout(() => setAvisoReset(''), 4000)
  }

  const tab = (id, texto) => (
    <button
      type="button"
      onClick={() => ir(id)}
      aria-current={pantalla === id ? 'page' : undefined}
      className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
        pantalla === id ? 'bg-white text-marca-700 shadow' : 'text-white/90 hover:bg-white/10'
      }`}
    >
      {texto}
    </button>
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-marca-700 text-white">
        <div className="mx-auto max-w-2xl px-4 pb-3 pt-4">
          <p className="text-xs uppercase tracking-wide text-white/70">{INSTITUTO.ciudad}</p>
          <h1 className="text-xl font-bold leading-tight">{INSTITUTO.nombre}</h1>
          <p className="mt-1 text-sm text-white/85">Reservá tu prueba de nivel, entrevista o clase de muestra.</p>
          <nav className="mt-3 flex gap-1 rounded-xl bg-marca-900/40 p-1" aria-label="Pantallas">
            {tab('turnos', 'Turnos')}
            {tab('mi-turno', 'Mi turno')}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-4">
        {!almacenamientoOk && (
          <div role="alert" className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <strong>Tu navegador no deja guardar datos</strong> (puede pasar en modo incógnito o con el almacenamiento bloqueado).
            Podés reservar igual, pero el turno se pierde al cerrar o recargar la página. Anotá tu código.
          </div>
        )}
        {avisoReset && (
          <div role="status" className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
            {avisoReset}
          </div>
        )}

        {pantalla === 'turnos' ? (
          <PantallaTurnos reservas={datos.reservas} onReservar={reservar} irAMiTurno={(c) => ir('mi-turno', c)} almacenamientoOk={almacenamientoOk} />
        ) : (
          <PantallaMiTurno key={codigoParaVer} reservas={datos.reservas} codigoInicial={codigoParaVer} onCancelar={cancelar} irATurnos={() => ir('turnos')} />
        )}
      </main>

      <footer className="mx-auto max-w-2xl px-4 pb-10 pt-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <p className="font-semibold text-slate-700">Datos de ejemplo</p>
          <p className="mt-1 text-slate-600">
            Esta versión de prueba guarda todo en este navegador. «Restablecer» borra tus reservas de prueba y vuelve a cargar las seis reservas de ejemplo.
          </p>
          {!confirmarReset ? (
            <button type="button" onClick={() => setConfirmarReset(true)} className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto">
              Restablecer datos de ejemplo
            </button>
          ) : (
            <div className="mt-3 rounded-lg bg-slate-50 p-3">
              <p className="text-slate-700">¿Seguro? Se borran las reservas que hiciste en este navegador.</p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <button type="button" onClick={hacerReset} className="rounded-lg bg-slate-800 px-3 py-2 font-semibold text-white">Sí, restablecer</button>
                <button type="button" onClick={() => setConfirmarReset(false)} className="rounded-lg border border-slate-300 px-3 py-2 font-semibold">No, dejar como está</button>
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  )
}
