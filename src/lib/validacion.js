// Validaciones del formulario. Devuelven { campo: 'mensaje' } solo con los errores.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function contarLetras(texto) {
  return (texto.match(/\p{L}/gu) || []).length
}

// Edad: primero el rango general, después el rango del tipo elegido.
export function validarEdad(edadTexto, tipo, edadGeneral) {
  const t = String(edadTexto ?? '').trim()
  if (t === '') return 'Ingresá la edad.'
  if (!/^\d+$/.test(t)) return 'La edad tiene que ser un número entero.'
  const edad = Number(t)
  if (edad < edadGeneral.min || edad > edadGeneral.max) {
    return `La edad tiene que estar entre ${edadGeneral.min} y ${edadGeneral.max} años.`
  }
  if (tipo && (edad < tipo.edad.min || edad > tipo.edad.max)) {
    return `Con ${edad} años no corresponde «${tipo.nombre}» (es para ${tipo.edad.min} a ${tipo.edad.max} años). Elegí otro tipo de turno.`
  }
  return null
}

export function validarFormulario(datos, tipo, edadGeneral, niveles) {
  const errores = {}
  const nombre = (datos.nombre || '').trim()
  if (contarLetras(nombre) < 3) errores.nombre = 'Escribí el nombre de quien va a cursar (mínimo 3 letras).'
  const errEdad = validarEdad(datos.edad, tipo, edadGeneral)
  if (errEdad) errores.edad = errEdad
  if (!EMAIL_RE.test((datos.email || '').trim())) errores.email = 'Revisá el email, el formato no es válido (ej.: nombre@mail.com).'
  if (!niveles.includes(datos.nivel)) errores.nivel = 'Elegí el nivel que creés tener.'
  return errores
}
