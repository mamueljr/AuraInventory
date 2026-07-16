import type { SearchDoc, SearchHit } from './index-core'
import type { WorkerRequest, WorkerResponse } from './search-worker'

/** Omit que distribuye sobre uniones (Omit normal colapsa a las props comunes). */
type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never

export interface BuildStats {
  count: number
  ms: number
}

export interface SearchResult {
  hits: SearchHit[]
  ms: number
}

/** Envoltura promise-based del worker de búsqueda. */
export class SearchWorkerClient {
  private worker: Worker | null = null
  private reqId = 0
  private pending = new Map<number, (response: WorkerResponse) => void>()

  private ensureWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL('./search-worker.ts', import.meta.url), { type: 'module' })
      this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const resolve = this.pending.get(event.data.reqId)
        this.pending.delete(event.data.reqId)
        resolve?.(event.data)
      }
    }
    return this.worker
  }

  private request(message: DistributiveOmit<WorkerRequest, 'reqId'>): Promise<WorkerResponse> {
    const reqId = ++this.reqId
    return new Promise((resolve) => {
      this.pending.set(reqId, resolve)
      this.ensureWorker().postMessage({ ...message, reqId })
    })
  }

  async build(docs: SearchDoc[]): Promise<BuildStats> {
    const res = await this.request({ type: 'build', docs })
    if (res.type !== 'built') throw new Error('Respuesta inesperada del worker')
    return { count: res.count, ms: res.ms }
  }

  async search(query: string, limit = 12): Promise<SearchResult> {
    const res = await this.request({ type: 'search', query, limit })
    if (res.type !== 'results') throw new Error('Respuesta inesperada del worker')
    return { hits: res.hits, ms: res.ms }
  }
}
