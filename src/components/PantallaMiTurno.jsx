import { useState } from 'react'
import { TIPOS, RESERVAS_EJEMPLO } from '../data/config.js'
import { normalizarCodigo } from '../lib/codigo.js'
import DetalleTurno, { AccionesCompartir } from './DetalleTurno.jsx'

export default function PantallaMiTurno({ reservas, codigoInicial, onCancelar, irATurnos }) {
  const [texto, setTexto] = useState(codigoInicial)
  const [buscado, setBuscado] = useState(normalizarCodigo(codigoInicial))
  const [error, setError] = useState(() =>
    codigoInicial && !reservas.some((r) => r.codigo === normalizarCodigo(codigoInicial)) ? `No encontramos ningún turno con el código «${normalizarCodigo(codigoInicial)}».` : '',
  )
  const [confirmando, setConfirmando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const reserva = buscado ? reservas.find((r) => r.codigo === buscado) : null
  const tipo = reserva ? TIPOS.find((t) => t.id === reserva.tipoId) : null

  const buscar = (e) => {
    e.preventDefault()
    const c = normalizarCodigo(texto)
    setConfirmando(false)
    setMensaje('')
    if (!c) {
      setBuscado('')
      return setError('Escribí el código que te dimos al reservar.')
    }
    setBuscado(c)
    setError(reservas.some((r) => r.codigo === c) ? '' : `No encontramos ningún turno con el código «${c}». Revisá que esté bien escrito (son 6 letras y números).`)
  }

  const cancelar = () => {
    const guardado = onCancelar(reserva.codigo)
    setConfirmando(false)
    setMensaje(guardado ? 'Listo, cancelamos tu turno. El lugar ya quedó libre para otra persona.' : 'Cancelamos tu turno, pero el navegador no dejó guardar el cambio: si recargás la página puede volver a aparecer.')
  }

  return (
    <div>
      <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-1 text-base font-bold">Buscá tu turno</h2>
        <p className="mb-3 text-sm text-slate-600">Ingresá el código de 6 caracteres que recibiste al reservar.</p>
        <form onSubmit={buscar} className="flex flex-col gap-2 sm:flex-row" noValidate>
          <label className="sr-only" htmlFor="codigo">Código de turno</label>
          <input
            id="codigo"
            name="codigo"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ej.: K7QM4P"
            autoCapitalize="characters"
            autoComplete="off"
            maxLength={12}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-base uppercase tracking-widest outline-none focus:ring-2 focus:ring-marca-500"
          />
          <button type="submit" data-testid="btn-buscar" className="rounded-lg bg-marca-600 px-4 py-2.5 font-semibold text-white hover:bg-marca-700">
            Buscar
          </button>
        </form>
        {error && (
          <p role="alert" data-testid="error-codigo" className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-800">
            {error}
          </p>
        )}
        <p className="mt-3 text-xs text-slate-500">
          Para probar con los datos de ejemplo: {RESERVAS_EJEMPLO.slice(0, 2).map((r) => r.codigo).join(' o ')}.
        </p>
      </section>

      {reserva && tipo && (
        <section data-testid="detalle-turno" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold">
              Turno <span className="font-mono tracking-widest">{reserva.codigo}</span>
            </h2>
            <span data-testid="estado-turno" className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${reserva.estado === 'activa' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
              {reserva.estado === 'activa' ? 'Confirmado' : 'Cancelado'}
            </span>
          </div>

          {mensaje && (
            <p role="status" data-testid="mensaje-cancelado" className="mb-3 rounded-lg bg-emerald-50 p-2 text-sm text-emerald-900">
              {mensaje}
            </p>
          )}

          <DetalleTurno reserva={reserva} tipo={tipo} />

          {reserva.estado === 'activa' ? (
            <div className="mt-4 flex flex-col gap-2">
              <AccionesCompartir reserva={reserva} tipo={tipo} />
              {!confirmando ? (
                <button type="button" data-testid="btn-cancelar" onClick={() => setConfirmando(true)} className="rounded-lg border border-red-300 px-3 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50">
                  Cancelar turno
                </button>
              ) : (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm">
                  <p className="text-red-900">¿Seguro que querés cancelar este turno? El lugar se libera para otra persona y no se puede deshacer.</p>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <button type="button" data-testid="btn-confirmar-cancelar" onClick={cancelar} className="rounded-lg bg-red-600 px-3 py-2 font-semibold text-white">
                      Sí, cancelar turno
                    </button>
                    <button type="button" onClick={() => setConfirmando(false)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold">
                      No, mantenerlo
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4">
              {!mensaje && <p className="mb-3 text-sm text-slate-600">Este turno está cancelado.</p>}
              <button type="button" onClick={irATurnos} className="w-full rounded-lg bg-marca-600 px-3 py-2.5 text-sm font-semibold text-white sm:w-auto">
                Reservar un turno nuevo
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
