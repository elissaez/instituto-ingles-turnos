import { INSTITUTO } from '../data/config.js'
import { capitalizar, fechaLarga } from '../lib/fechas.js'
import { horarioTexto, precioTexto, urlWhatsApp } from '../lib/formato.js'
import { descargarICS } from '../lib/ics.js'

export function Fila({ etiqueta, children }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-slate-100 py-2 last:border-0 sm:flex-row sm:gap-4">
      <dt className="w-32 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">{etiqueta}</dt>
      <dd className="min-w-0 break-words text-slate-800">{children}</dd>
    </div>
  )
}

export default function DetalleTurno({ reserva, tipo }) {
  return (
    <dl className="text-sm">
      <Fila etiqueta="Tipo">{tipo.nombre}</Fila>
      <Fila etiqueta="Día">{capitalizar(fechaLarga(reserva.fecha))}</Fila>
      <Fila etiqueta="Horario">{horarioTexto(reserva, tipo)} ({tipo.duracionMin} min)</Fila>
      <Fila etiqueta="Precio">{precioTexto(tipo.precio)}</Fila>
      <Fila etiqueta="Quién cursa">{reserva.nombre} · {reserva.edad} años</Fila>
      <Fila etiqueta="Email">{reserva.email}</Fila>
      <Fila etiqueta="Nivel">{reserva.nivel}</Fila>
      <Fila etiqueta="Dónde">{INSTITUTO.direccion}</Fila>
    </dl>
  )
}

export function AccionesCompartir({ reserva, tipo }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <button
        type="button"
        onClick={() => descargarICS(reserva, tipo, INSTITUTO)}
        className="rounded-lg border border-marca-500 px-3 py-2.5 text-sm font-semibold text-marca-700 hover:bg-marca-50"
      >
        Descargar al calendario (.ics)
      </button>
      <a
        href={urlWhatsApp(reserva, tipo, INSTITUTO)}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg bg-emerald-600 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Compartir por WhatsApp
      </a>
    </div>
  )
}
