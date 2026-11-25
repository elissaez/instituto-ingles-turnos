// Código corto de 6 caracteres, sin letras que se confunden (0/O, 1/I/L).
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function generarCodigo(existentes = new Set(), random = Math.random) {
  for (let intento = 0; intento < 1000; intento++) {
    let c = ''
    for (let i = 0; i < 6; i++) c += ALFABETO[Math.floor(random() * ALFABETO.length)]
    if (!existentes.has(c)) return c
  }
  throw new Error('No se pudo generar un código único')
}

// Acepta 'k7qm4p', ' K7Q-M4P ' etc.
export function normalizarCodigo(texto) {
  return String(texto || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
}
