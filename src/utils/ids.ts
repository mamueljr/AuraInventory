/** UUID v4 generado en cliente — clave para la sincronización futura (sin re-mapeos). */
export const newId = () => crypto.randomUUID()

export const nowIso = () => new Date().toISOString()
