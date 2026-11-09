import { arithmetic } from './arithmetic.js'
import { algebra } from './algebra.js'
import { derivative } from './derivative.js'
import { integral } from './integral.js'
import { limit } from './limit.js'
import { ReckoningError } from './common.js'

const ENGINES = { arithmetic, algebra, derivative, integral, limit }

/**
 * Compute a chapter's demonstration.
 * Returns { given, steps: [{ note, sub?, tex? }], result } or { error }.
 */
export function compute(chapterId, values, mode) {
  try {
    return ENGINES[chapterId](values, mode)
  } catch (e) {
    const message =
      e instanceof ReckoningError ? e.message : `The reckoning hath failed: ${e?.message || e}`
    return { error: message }
  }
}
