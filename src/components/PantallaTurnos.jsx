import { useMemo, useRef, useState } from 'react'
import { TIPOS, NIVELES, EDAD_GENERAL, INSTITUTO, DIAS_HABILES_A_MOSTRAR, FERIADOS } from '../data/config.js'
import { franjasDelTipo, hayFranjasLibres, etiquetaLibres } from '../lib/disponibilidad.js'
import { validarFormulario, validarEdad } from '../lib/validacion.js'
import { hoyEnZona, fechaLarga, capitalizar } from '../lib/fechas.js'
import { precioTexto, capacidadTexto } from '../lib/formato.js'
import DetalleTurno, { AccionesCompartir } from './DetalleTurno.jsx'

const VACIO = { nombre: '', edad: '', email: '', nivel: '' }

function Paso({ numero, titulo, children }) {
  return (
    <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-800">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-marca-600 text-xs text-white">{numero}</span>
        {titulo}
      </h2>
      {children}
    </section>
  )
}

function Error({ id, children }) {
  if (!children) return null
  return (
    <p id={id} className="mt-1 text-sm text-red-700">
      {children}
    </p>
  )
}

export default function PantallaTurnos({ reservas, onReservar, irAMiTurno, almacenamientoOk }) {
  const [tipoId, setTipoId] = useState('')
  const [franja, setFranja] = useState(null) // { fecha, hora }
  const [form, setForm] = useState(VACIO)
  const [tocados, setTocados] = useState({})
  const [intentoEnviar, setIntentoEnviar] = useState(false)
  const [avisoTipo, setAvisoTipo] = useState('')
  const [errorReserva, setErrorReserva] = useState('')
  const [confirmada, setConfirmada] = useState(null)
  const refFranjas = useRef(null)
  const refForm = useRef(null)

  const tipo = TIPOS.find((t) => t.id === tipoId) || null
  const hoy = hoyEnZona(INSTITUTO.zonaHoraria)

  const dias = useMemo(
    () => (tipo ? franjasDelTipo(tipo, reservas, { hoy, cantidadDias: DIAS_HABILES_A_MOSTRAR, feriados: FERIADOS }) : []),
    [tipo, reservas, hoy],
  )

  // Si la franja elegida se completó (p. ej. otra pestaña), se deselecciona.
  const franjaActual = franja && dias.flatMap((d) => d.franjas).find((f) => f.fecha === franja.fecha && f.hora === franja.hora)
  const franjaValida = franjaActual && !franjaActual.completo ? franjaActual : null

  const errores = validarFormulario(form, tipo, EDAD_GENERAL, NIVELES)
  const avisoEdad = form.edad.trim() !== '' ? validarEdad(form.edad, tipo, EDAD_GENERAL) : null
  const mostrar = (campo) => (tocados[campo] || intentoEnviar ? errores[campo] : null)

  const elegirTipo = (nuevoId) => {
    if (nuevoId === tipoId) return
    const habiaFranja = !!franja
    setTipoId(nuevoId)
    setFranja(null) // las franjas son de cada tipo: hay que volver a elegir
    setErrorReserva('')
    const nuevoTipo = TIPOS.find((t) => t.id === nuevoId)
    const edadNoVa = form.edad.trim() !== '' && validarEdad(form.edad, nuevoTipo, EDAD_GENERAL)
    const avisos = []
    if (habiaFranja) avisos.push('Cambiaste el tipo de turno: elegí de nuevo el día y el horario.')
    if (edadNoVa) avisos.push('Revisá la edad: no corresponde al nuevo tipo.')
    setAvisoTipo(avisos.join(' '))
    setTimeout(() => refFranjas.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const elegirFranja = (f) => {
    if (f.completo) return
    setFranja({ fecha: f.fecha, hora: f.hora })
    setAvisoTipo('')
    setErrorReserva('')
    setTimeout(() => refForm.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))
  const tocar = (campo) => () => setTocados((t) => ({ ...t, [campo]: true }))

  const enviar = (e) => {
    e.preventDefault()
    setIntentoEnviar(true)
    setErrorReserva('')
    if (!tipo) return setErrorReserva('Elegí un tipo de turno.')
    if (!franjaValida) return setErrorReserva('Elegí un día y un horario con lugar.')
    if (Object.keys(errores).length > 0) return
    const r = onReservar({
      tipoId: tipo.id,
      fecha: franjaValida.fecha,
      hora: franjaValida.hora,
      nombre: form.nombre.trim().replace(/\s+/g, ' '),
      edad: Number(form.edad),
      email: form.email.trim(),
      nivel: form.nivel,
    })
    if (!r.ok) {
      setFranja(null)
      return setErrorReserva(r.error)
    }
    setConfirmada({ reserva: r.reserva, guardado: r.guardado })
    window.scrollTo(0, 0)
  }

  const nuevaReserva = () => {
    setConfirmada(null)
    setTipoId('')
    setFranja(null)
    setForm(VACIO)
    setTocados({})
    setIntentoEnviar(false)
    setAvisoTipo('')
  }

  // ---------- Pantalla de confirmación ----------
  if (confirmada) {
    const t = TIPOS.find((x) => x.id === confirmada.reserva.tipoId)
    return (
      <section className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm" aria-live="polite">
        <p className="text-sm font-semibold text-emerald-700">¡Turno confirmado!</p>
        <p className="mt-2 text-sm text-slate-600">Tu código de turno es</p>
        <p data-testid="codigo-reserva" className="my-1 select-all font-mono text-4xl font-bold tracking-widest text-slate-900">
          {confirmada.reserva.codigo}
        </p>
        <p className="mb-3 text-sm text-slate-600">Guardalo: lo vas a necesitar para ver o cancelar tu turno en «Mi turno».</p>
        {!confirmada.guardado && (
          <p role="alert" className="mb-3 rounded-lg bg-amber-50 p-2 text-sm text-amber-900">
            Ojo: el navegador no dejó guardar la reserva. Si recargás la página se pierde.
          </p>
        )}
        <DetalleTurno reserva={confirmada.reserva} tipo={t} />
        <div className="mt-4 flex flex-col gap-2">
          <AccionesCompartir reserva={confirmada.reserva} tipo={t} />
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => irAMiTurno(confirmada.reserva.codigo)} className="rounded-lg bg-marca-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-marca-700">
              Ver en «Mi turno»
            </button>
            <button type="button" onClick={nuevaReserva} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700">
              Reservar otro turno
            </button>
          </div>
        </div>
      </section>
    )
  }

  // ---------- Pantalla de turnos ----------
  const inputCls = (campo) =>
    `mt-1 block w-full rounded-lg border px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-marca-500 ${
      mostrar(campo) ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'
    }`

  return (
    <div>
      <Paso numero="1" titulo="¿Qué turno querés?">
        <div role="radiogroup" aria-label="Tipo de turno" className="flex flex-col gap-2">
          {TIPOS.map((t) => {
            const activo = t.id === tipoId
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={activo}
                data-testid={`tipo-${t.id}`}
                onClick={() => elegirTipo(t.id)}
                className={`rounded-xl border p-3 text-left transition ${activo ? 'border-marca-600 bg-marca-50 ring-2 ring-marca-500' : 'border-slate-200 hover:border-marca-500'}`}
              >
                <span className="block font-semibold text-slate-900">{t.nombre}</span>
                <span className="block text-sm text-slate-600">{t.destinatarios} · de {t.edad.min} a {t.edad.max} años</span>
                <span className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5">{t.duracionMin} min</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5">{precioTexto(t.precio)}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5">{capacidadTexto(t)}</span>
                </span>
              </button>
            )
          })}
        </div>
      </Paso>

      <div ref={refFranjas} className="scroll-mt-4">
        <Paso numero="2" titulo="Elegí día y horario">
          {avisoTipo && (
            <p role="status" data-testid="aviso-tipo" className="mb-3 rounded-lg bg-amber-50 p-2 text-sm text-amber-900">
              {avisoTipo}
            </p>
          )}
          {!tipo ? (
            <p className="text-sm text-slate-500">Primero elegí el tipo de turno para ver los horarios libres.</p>
          ) : !hayFranjasLibres(dias) ? (
            <div data-testid="sin-franjas" className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold">No quedan horarios libres en los próximos {DIAS_HABILES_A_MOSTRAR} días hábiles para «{tipo.nombre}».</p>
              <p className="mt-1">Probá con otro tipo de turno o volvé a mirar en unos días: si alguien cancela, el lugar se libera.</p>
            </div>
          ) : (
            <>
              <p className="mb-3 text-sm text-slate-500">Próximos {DIAS_HABILES_A_MOSTRAR} días hábiles · {capacidadTexto(tipo)}.</p>
              <ul className="flex flex-col gap-3">
                {dias.map((d) => {
                  const lleno = d.franjas.every((f) => f.completo)
                  return (
                    <li key={d.fecha} data-testid={`dia-${d.fecha}`}>
                      <p className="mb-1.5 text-sm font-semibold text-slate-700">
                        {capitalizar(fechaLarga(d.fecha))}
                        {lleno && <span className="ml-2 text-xs font-normal text-slate-500">· sin lugares</span>}
                      </p>
                      <div className="grid grid-cols-2 gap-2 min-[400px]:grid-cols-3">
                        {d.franjas.map((f) => {
                          const sel = franjaValida && franjaValida.fecha === f.fecha && franjaValida.hora === f.hora
                          return (
                            <button
                              key={f.hora}
                              type="button"
                              disabled={f.completo}
                              aria-pressed={!!sel}
                              data-testid={`franja-${f.fecha}-${f.hora}`}
                              onClick={() => elegirFranja(f)}
                              className={`rounded-lg border px-2 py-2 text-center transition ${
                                f.completo
                                  ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                                  : sel
                                    ? 'border-marca-600 bg-marca-600 text-white'
                                    : 'border-slate-300 bg-white hover:border-marca-500'
                              }`}
                            >
                              <span className={`block text-base font-semibold ${f.completo ? 'line-through' : ''}`}>{f.hora}</span>
                              <span className={`block text-xs ${sel ? 'text-white/90' : f.completo ? 'text-slate-500' : 'text-emerald-700'}`}>{etiquetaLibres(f, tipo)}</span>
                            </button>
                          )
                        })}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </Paso>
      </div>

      <div ref={refForm} className="scroll-mt-4">
        <Paso numero="3" titulo="Tus datos">
          {franjaValida && tipo && (
            <p data-testid="resumen-franja" className="mb-3 rounded-lg bg-marca-50 p-2 text-sm text-marca-900">
              {tipo.nombre} · {capitalizar(fechaLarga(franjaValida.fecha))} a las {franjaValida.hora}
            </p>
          )}
          <form onSubmit={enviar} noValidate className="flex flex-col gap-3">
            <label className="block text-sm font-medium">
              Nombre de quien va a cursar
              <input type="text" autoComplete="name" value={form.nombre} onChange={cambiar('nombre')} onBlur={tocar('nombre')} className={inputCls('nombre')} aria-invalid={!!mostrar('nombre')} aria-describedby="err-nombre" name="nombre" />
              <Error id="err-nombre">{mostrar('nombre')}</Error>
            </label>
            <label className="block text-sm font-medium">
              Edad
              <input type="number" inputMode="numeric" min={EDAD_GENERAL.min} max={EDAD_GENERAL.max} value={form.edad} onChange={cambiar('edad')} onBlur={tocar('edad')} className={inputCls('edad')} aria-invalid={!!(avisoEdad || mostrar('edad'))} aria-describedby="err-edad" name="edad" />
              {/* El aviso de edad se muestra apenas se escribe, porque depende del tipo elegido */}
              <Error id="err-edad">{avisoEdad || mostrar('edad')}</Error>
            </label>
            <label className="block text-sm font-medium">
              Email
              <input type="email" autoComplete="email" inputMode="email" value={form.email} onChange={cambiar('email')} onBlur={tocar('email')} className={inputCls('email')} aria-invalid={!!mostrar('email')} aria-describedby="err-email" name="email" />
              <Error id="err-email">{mostrar('email')}</Error>
            </label>
            <label className="block text-sm font-medium">
              Nivel que creés tener
              <select value={form.nivel} onChange={cambiar('nivel')} onBlur={tocar('nivel')} className={inputCls('nivel')} aria-invalid={!!mostrar('nivel')} aria-describedby="err-nivel" name="nivel">
                <option value="">Elegí una opción</option>
                {NIVELES.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <Error id="err-nivel">{mostrar('nivel')}</Error>
            </label>

            {errorReserva && (
              <p role="alert" data-testid="error-reserva" className="rounded-lg bg-red-50 p-2 text-sm text-red-800">
                {errorReserva}
              </p>
            )}

            <button
              type="submit"
              data-testid="btn-reservar"
              disabled={!tipo || !franjaValida || !!avisoEdad}
              className="mt-1 rounded-xl bg-marca-600 px-4 py-3 text-base font-bold text-white shadow hover:bg-marca-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              Reservar
            </button>
            {(!tipo || !franjaValida) && <p className="text-center text-xs text-slate-500">Elegí tipo, día y horario para poder reservar.</p>}
            {!almacenamientoOk && <p className="text-center text-xs text-amber-800">Sin guardado en este navegador: anotá el código al reservar.</p>}
          </form>
        </Paso>
      </div>
    </div>
  )
}
