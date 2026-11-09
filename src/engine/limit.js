// Liber V — limits, two-sided or from one side, checked by numerical approach.
import nerdamer from 'nerdamer'
import {
  math, normalize, cleanVar, tex, writtenTex, parse, numericFn, evalNumber, valueOf, fmt,
  exactWithApprox, unevaluated, ReckoningError,
} from './common.js'
import { diff, tidy, str } from './derivative.js'

const strip = (n) => (n.isParenthesisNode ? strip(n.content) : n)

/** Approach the point numerically; returns a number, ±Infinity, or NaN (no limit). */
function numericLimit(fn, a, side) {
  const xs = []
  if (Number.isFinite(a)) for (let k = 2; k <= 9; k++) xs.push(a + side * 10 ** -k)
  else for (let k = 2; k <= 9; k++) xs.push(Math.sign(a) * 10 ** k)
  const ys = xs.map(fn)
  const tail = ys.slice(-5)
  if (tail.some((y) => Number.isNaN(y))) return NaN
  if (tail.every((y) => y === Infinity) || (tail.every((y) => y > 0) && tail.at(-1) > 1e6 && tail.at(-1) > tail[0] * 10)) return Infinity
  if (tail.every((y) => y === -Infinity) || (tail.every((y) => y < 0) && tail.at(-1) < -1e6 && tail.at(-1) < tail[0] * 10)) return -Infinity
  const [p, q, r] = ys.slice(3, 6) // mid-range values: close enough yet free of rounding error
  const scale = Math.max(1, Math.abs(r))
  if (Math.abs(r) < 1e-5 && Math.abs(r) <= Math.abs(p)) return 0
  if (Math.abs(q - r) < 1e-4 * scale && Math.abs(p - q) < 1e-3 * scale) {
    return Number(r.toPrecision(7))
  }
  return NaN
}

function symbolicLimit(f, v, a, aStr, side) {
  const where = Number.isFinite(a) ? `, ${side < 0 ? 'left' : 'right'}` : ''
  const point = a === Infinity ? 'Infinity' : a === -Infinity ? '-Infinity' : `(${aStr})`
  try {
    const r = nerdamer(`limit(${f}, ${v}, ${point}${where})`).toString()
    if (unevaluated(r, 'limit') || /undefined|NaN/.test(r)) return null
    return r
  } catch {
    return null
  }
}

/** One-sided (or, at infinity, the only) limit, as { str, num }. */
function sideLimit(f, fn, v, a, side, aStr) {
  const num = numericLimit(fn, a, side)
  const sym = symbolicLimit(f, v, a, aStr, side)
  if (sym !== null) {
    const s = valueOf(sym)
    const disagree =
      Number.isFinite(num) && Number.isFinite(s) && Math.abs(s - num) > 1e-3 * Math.max(1, Math.abs(num))
    if (!disagree) {
      return { str: sym, num: Number.isNaN(s) ? num : s, exact: true }
    }
  }
  if (Number.isNaN(num)) return { str: null, num: NaN }
  return { str: null, num, exact: false }
}

const show = (r) =>
  r.str !== null ? exactWithApprox(r.str) : Number.isNaN(r.num) ? '\\text{does not exist}' : Number.isFinite(r.num) ? `\\approx ${fmt(r.num)}` : fmt(r.num)

const eq = (r) => {
  const s = show(r)
  if (s.startsWith('\\approx')) return s
  if (s.startsWith('\\text')) return `\\;${s}`
  return `= ${s}`
}

const same = (l, r) =>
  l.num === r.num || (Number.isFinite(l.num) && Number.isFinite(r.num) && Math.abs(l.num - r.num) < 1e-6 * Math.max(1, Math.abs(l.num)))

function classify(n, d) {
  const z = (x) => Math.abs(x) < 1e-9
  const inf = (x) => !Number.isFinite(x) && !Number.isNaN(x)
  if (z(n) && z(d)) return '\\tfrac{0}{0}'
  if (inf(n) && inf(d)) return '\\tfrac{\\infty}{\\infty}'
  return null
}

export function limit({ expr, var: rawVar, to }, mode = 'Both sides') {
  const v = cleanVar(rawVar)
  const src = normalize(expr)
  if (!src) throw new ReckoningError('The slate is empty; inscribe a function first.')
  if (String(to ?? '').trim() === '') throw new ReckoningError('Say what value the variable approacheth.')
  const aStr = normalize(to)
  const a = evalNumber(to)
  const f = parse(src).toString()
  const fn = numericFn(src, v)

  const side = mode === 'From left' ? -1 : mode === 'From right' ? 1 : 0
  const arrow = `${v} \\to ${tex(aStr)}${side < 0 ? '^{-}' : side > 0 ? '^{+}' : ''}`
  const given = `\\lim_{${arrow}} ${writtenTex(src)}`
  const steps = []

  // I. Direct substitution
  if (Number.isFinite(a)) {
    const y = fn(a)
    if (Number.isFinite(y)) {
      steps.push({ note: 'By direct substitution', tex: `f(${tex(aStr)}) = ${fmt(y)}` })
    } else {
      steps.push({ note: 'Direct substitution faileth, the function being undefined at that point' })
    }
  }

  // II. Indeterminate quotients and the rule of l'Hôpital
  let node = null
  try {
    node = strip(math.parse(src))
  } catch {
    /* skip */
  }
  if (node && node.isOperatorNode && node.fn === 'divide') {
    const [num, den] = node.args.map((x) => str(strip(x)))
    const s = side || 1
    const nv = Number.isFinite(a) ? numericLimit(numericFn(num, v), a, s) : numericLimit(numericFn(num, v), a, 1)
    const dv = Number.isFinite(a) ? numericLimit(numericFn(den, v), a, s) : numericLimit(numericFn(den, v), a, 1)
    const form = classify(nv, dv)
    if (form) {
      steps.push({ note: 'The form being indeterminate', tex: form })
      try {
        const n1 = tidy(diff(num, v))
        const d1 = tidy(diff(den, v))
        steps.push({
          note: 'By the rule of l’Hôpital, the fluxions of numerator and denominator are taken',
          tex: `\\lim_{${arrow}} \\dfrac{${tex(n1)}}{${tex(d1)}}`,
        })
      } catch {
        /* skip */
      }
    }
  }

  // III. The approach itself
  let result
  if (!Number.isFinite(a)) {
    steps.push({ note: `The variable increasing without bound${a < 0 ? ' in the negative sense' : ''}, the behaviour of the function is examined` })
  }
  if (!Number.isFinite(a) || side !== 0) {
    const r = sideLimit(f, fn, v, a, side || 1, aStr)
    result = show(r)
    if (!r.exact && r.str === null && !Number.isNaN(r.num)) {
      steps.push({ note: 'No closed form presenting itself, the value is found by approaching ever nearer, numerically' })
    }
  } else {
    const L = sideLimit(f, fn, v, a, -1, aStr)
    const R = sideLimit(f, fn, v, a, 1, aStr)
    steps.push({
      note: 'Approaching from either side',
      tex: `\\lim_{${v} \\to ${tex(aStr)}^{-}} f ${eq(L)},\\qquad \\lim_{${v} \\to ${tex(aStr)}^{+}} f ${eq(R)}`,
    })
    if (Number.isNaN(L.num) || Number.isNaN(R.num)) {
      steps.push({ note: 'The function oscillateth or is undefined near the point, and settleth upon no value' })
      result = '\\text{The limit does not exist}'
    } else if (!same(L, R)) {
      steps.push({ note: 'The two one-sided limits disagreeing, the limit hath no single value' })
      result = '\\text{The limit does not exist}'
    } else {
      steps.push({ note: 'The two sides agreeing, the limit is their common value' })
      result = show(L.str !== null ? L : R)
    }
  }

  return { given, steps, result: result.startsWith('\\text') ? result : `${result}` }
}
