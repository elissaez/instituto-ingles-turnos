// ============================================================
//  ARCHIVO DE DATOS — acá se cambia todo lo del instituto
//  (tipos de turno, franjas, cupos, rangos de edad, feriados
//  y las reservas de ejemplo). No hace falta tocar otro archivo.
//  Todos los datos son sintéticos (inventados para la demo).
// ============================================================

export const INSTITUTO = {
  nombre: 'Instituto de Inglés del Barrio',
  ciudad: 'Mar del Plata',
  direccion: 'Calle Ejemplo 1234, Mar del Plata',
  // Zona horaria del instituto. Argentina usa UTC-3 todo el año.
  zonaHoraria: 'America/Argentina/Buenos_Aires',
  offsetUTC: '-03:00',
}

// Clave propia en localStorage. La app SOLO lee y escribe esta clave.
// Si cambiás la forma de los datos guardados, subí el número de versión.
export const STORAGE_KEY = 'kodarvia.instituto-ingles.turnos.v1'

// Edad general aceptada por el formulario (cualquier tipo).
export const EDAD_GENERAL = { min: 6, max: 80 }

// Cuántos días hábiles se muestran hacia adelante (empezando mañana).
export const DIAS_HABILES_A_MOSTRAR = 10

// Días sin clases (formato AAAA-MM-DD). Se saltean como si fueran fin de semana.
export const FERIADOS = [
  '2026-12-08', // Inmaculada Concepción
  '2026-12-25', // Navidad
  '2027-01-01', // Año Nuevo
  '2027-02-15', // Carnaval
  '2027-02-16', // Carnaval
  '2027-03-24', // Día de la Memoria
]

// Niveles que la persona cree tener.
export const NIVELES = ['Nunca estudié', 'Básico', 'Intermedio', 'Avanzado']

// ------------------------------------------------------------
//  TIPOS DE TURNO
//  - duracionMin: duración en minutos (se usa también en el .ics)
//  - precio: en pesos argentinos (0 = sin cargo)
//  - unidad: 'persona' → cada franja admite UNA reserva
//            'grupo'   → cada franja admite `cupo` reservas
//  - cupo: lugares por franja (para 'persona' siempre es 1)
//  - edad: rango permitido para ese tipo
//  - diasSemana: 1=lunes … 5=viernes (6 y 7 no se usan, son fin de semana)
//  - horarios: hora de inicio de cada franja, en hora local del instituto
// ------------------------------------------------------------
export const TIPOS = [
  {
    id: 'prueba-nivel',
    nombre: 'Prueba de nivel',
    destinatarios: 'Adultos y adolescentes',
    descripcion: 'Una charla corta y un ejercicio escrito para saber en qué curso empezar.',
    duracionMin: 30,
    precio: 0,
    unidad: 'persona',
    cupo: 1,
    edad: { min: 12, max: 80 },
    diasSemana: [1, 2, 3, 4, 5],
    horarios: ['09:00', '09:30', '10:00', '17:00', '17:30', '18:00'],
  },
  {
    id: 'entrevista-chicos',
    nombre: 'Entrevista para chicos',
    destinatarios: 'Chicos',
    descripcion: 'Encuentro con la familia y un juego en inglés para ubicar al chico en su grupo.',
    duracionMin: 20,
    precio: 0,
    unidad: 'persona',
    cupo: 1,
    edad: { min: 6, max: 11 },
    diasSemana: [1, 2, 3, 4, 5],
    horarios: ['16:00', '16:30', '17:00'],
  },
  {
    id: 'clase-muestra',
    nombre: 'Clase de muestra de conversación',
    destinatarios: 'Adolescentes y adultos',
    descripcion: 'Una clase grupal real de conversación para conocer el método y al profe.',
    duracionMin: 60,
    precio: 5000,
    unidad: 'grupo',
    cupo: 4,
    edad: { min: 12, max: 80 },
    diasSemana: [1, 3, 5],
    horarios: ['18:30', '19:30'],
  },
]

// ------------------------------------------------------------
//  RESERVAS DE EJEMPLO
//  Se cargan la primera vez que se abre la app y cada vez que se
//  toca «Restablecer datos de ejemplo».
//  - dia: posición dentro de las franjas del TIPO (0 = primer día
//    en que ese tipo tiene franjas). Así siempre caen en fechas futuras.
//  - hora: tiene que ser uno de los `horarios` del tipo.
//  Contenido: una clase de muestra COMPLETA (4 de 4), una franja de
//  prueba de nivel ya tomada y otra clase de muestra con 1 de 4.
// ------------------------------------------------------------
export const RESERVAS_EJEMPLO = [
  { codigo: 'K7QM4P', tipoId: 'prueba-nivel', dia: 0, hora: '09:00', nombre: 'Lucía Fernández', edad: 34, email: 'lucia.fernandez@ejemplo.com', nivel: 'Básico' },
  { codigo: 'HT3WZ8', tipoId: 'clase-muestra', dia: 0, hora: '18:30', nombre: 'Martín Gómez', edad: 41, email: 'martin.gomez@ejemplo.com', nivel: 'Intermedio' },
  { codigo: 'R9DXA2', tipoId: 'clase-muestra', dia: 0, hora: '18:30', nombre: 'Sofía Ramírez', edad: 17, email: 'sofi.ramirez@ejemplo.com', nivel: 'Básico' },
  { codigo: 'BN5UCE', tipoId: 'clase-muestra', dia: 0, hora: '18:30', nombre: 'Julián Pérez', edad: 28, email: 'julian.perez@ejemplo.com', nivel: 'Avanzado' },
  { codigo: 'PV2LJ6', tipoId: 'clase-muestra', dia: 0, hora: '18:30', nombre: 'Carla Domínguez', edad: 55, email: 'carla.dominguez@ejemplo.com', nivel: 'Nunca estudié' },
  { codigo: 'MF8YS3', tipoId: 'clase-muestra', dia: 1, hora: '18:30', nombre: 'Tomás Acosta', edad: 22, email: 'tomas.acosta@ejemplo.com', nivel: 'Intermedio' },
]
