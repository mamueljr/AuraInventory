import type MiniSearch from 'minisearch'
import { createIndex, searchIndex, type SearchDoc } from './index-core'

/**
 * Worker de búsqueda: construir el índice de 50k documentos toma ~1s,
 * pero ocurre aquí — el hilo de UI nunca se bloquea.
 */
export type WorkerRequest =
  | { type: 'build'; reqId: number; docs: SearchDoc[] }
  | { type: 'search'; reqId: number; query: string; limit: number }

export type WorkerResponse =
  | { type: 'built'; reqId: number; count: number; ms: number }
  | { type: 'results'; reqId: number; hits: ReturnType<typeof searchIndex>; ms: number }

let index: MiniSearch<SearchDoc> | null = null

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const msg = event.data
  const started = performance.now()

  if (msg.type === 'build') {
    index = createIndex(msg.docs)
    const response: WorkerResponse = {
      type: 'built',
      reqId: msg.reqId,
      count: msg.docs.length,
      ms: performance.now() - started,
    }
    self.postMessage(response)
  }

  if (msg.type === 'search') {
    const hits = index ? searchIndex(index, msg.query, msg.limit) : []
    const response: WorkerResponse = {
      type: 'results',
      reqId: msg.reqId,
      hits,
      ms: performance.now() - started,
    }
    self.postMessage(response)
  }
}
