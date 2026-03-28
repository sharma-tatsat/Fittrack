declare module 'canvas-confetti' {
  interface Options {
    particleCount?: number
    angle?: number
    spread?: number
    startVelocity?: number
    decay?: number
    gravity?: number
    drift?: number
    ticks?: number
    origin?: {
      x?: number
      y?: number
    }
    colors?: string[]
    shapes?: ('square' | 'circle')[]
    scalar?: number
    zIndex?: number
    disableForReducedMotion?: boolean
  }

  interface GlobalOptions {
    resize?: boolean
    useWorker?: boolean
  }

  type CreateTypes = {
    (options?: Options): Promise<null>
    reset: () => void
  }

  function create(canvas: HTMLCanvasElement | null, options?: GlobalOptions): CreateTypes

  function confetti(options?: Options): Promise<null>

  export = confetti
}
