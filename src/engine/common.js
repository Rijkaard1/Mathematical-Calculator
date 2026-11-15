// Shared helpers: input normalisation, TeX formatting and numeric evaluation.
import nerdamer from 'nerdamer'
import { create, all } from 'mathjs'

export const math = create(all, {})

/** An error whose message is fit to be shown to the reader. */
export class ReckoningError extends Error {}

/**
 * Turn what the reader typed (with ×, ÷, π, √, ln, …) into a plain ASCII
 * expression understood by both mathjs and nerdamer.
 *  - `ln`  → natural log (`log` in both libraries)
 *  - `log` → base-10 log (`log10`)
 */
export function normalize(input, angle = 'rad') {
  if (input == null) return ''
  let s = degreeSign(String(input).trim(), angle)
  s = s
    .replace(/×|·|⋅|∙/g, '*')
    .replace(/÷|:/g, '/')
    .replace(/−|–|—/g, '-')
    .replace(/π/g, 'pi')
    .replace(/∞/g, 'Infinity')
    .replace(/√/g, 'sqrt')
    .replace(/\*\*/g, '^')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
  // log( … ) is base ten; ln( … ) is natural. Order matters.
  s = s.replace(/\blog\s*\(/g, 'log10(').replace(/\bln\s*\(/g, 'log(')
  // sqrt written without parentheses, e.g. "sqrt2" or "sqrt x"
  s = s.replace(/\bsqrt\s*(\d+(?:\.\d+)?|[a-z])\b/gi, 'sqrt($1)')
  // Infinity spelled out in various ways
  s = s.replace(/\b(inf|infinity|oo)\b/gi, 'Infinity')
  return s
}

/** Check that a variable name is a single letter (optionally with digits). */
export function cleanVar(v) {
  const name = (v || 'x').trim() || 'x'
  if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(name) || ['e', 'pi', 'i'].includes(name)) {
    throw new ReckoningError(`“${name}” is no fit name for a variable; use a letter such as x.`)
  }
  return name
}

/** Make nerdamer's LaTeX a little more like a printed book. */
function tidyTex(t) {
  return t
    .replace(/(\d) \\cdot (?=[a-zA-Z\\(])/g, '$1 ') // 2 \cdot x → 2 x
    .replace(/\\mathrm\{log\}|\\log/g, '\\ln')
    .replace(/\\operatorname\{log10\}|\\mathrm\{log10\}|\\log10|log10/g, '\\log_{10}')
    .replace(/\\mathrm\{Inf\}|\bInf\b/g, '\\infty')
}

/** LaTeX for a nerdamer-readable expression string. */
export function tex(expr) {
  const s = String(expr)
  if (s === 'Infinity' || s === 'Inf') return '\\infty'
  if (s === '-Infinity' || s === '-Inf') return '-\\infty'
  try {
    return tidyTex(nerdamer(s).toTeX())
  } catch {
    try {
      return tidyTex(nerdamer.convertToLaTeX(s))
    } catch {
      return `\\text{${s.replace(/[{}\\]/g, '')}}`
    }
  }
}

/** LaTeX of the expression as the reader wrote it (nerdamer would rewrite e^(-x²) as 1/e^(x²)). */
export function writtenTex(src) {
  try {
    return math.parse(src).toTex({ implicit: 'hide', parenthesis: 'keep' })
  } catch {
    return tex(src)
  }
}

/** Parse with nerdamer, turning library errors into readable ones. */
export function parse(expr) {
  if (!expr) throw new ReckoningError('The slate is empty; inscribe an expression first.')
  try {
    return nerdamer(expr)
  } catch (e) {
    throw new ReckoningError(`The expression could not be read: ${e.message}`)
  }
}

/** Compile an expression for fast numeric evaluation at a given variable value. */
export function numericFn(expr, v) {
  let compiled
  try {
    compiled = math.compile(expr)
  } catch {
    // mathjs cannot read something nerdamer wrote (e.g. erf); try nerdamer.
    const f = nerdamer(expr).buildFunction([v])
    return (x) => {
      try {
        const y = f(x)
        return typeof y === 'number' ? y : NaN
      } catch {
        return NaN
      }
    }
  }
  return (x) => {
    try {
      const y = compiled.evaluate({ [v]: x })
      if (typeof y === 'number') return y
      if (y && typeof y.re === 'number') return Math.abs(y.im) < 1e-12 ? y.re : NaN
      return Number(y)
    } catch {
      return NaN
    }
  }
}

/** Evaluate a constant expression (e.g. "pi/2", "sqrt(2)") to a number. */
export function evalNumber(expr) {
  const s = normalize(expr)
  if (/^-?Infinity$/.test(s)) return s.startsWith('-') ? -Infinity : Infinity
  try {
    const v = math.evaluate(s)
    const n = typeof v === 'number' ? v : Number(v)
    if (Number.isNaN(n)) throw new Error()
    return n
  } catch {
    throw new ReckoningError(`“${expr}” is not a number that can be reckoned.`)
  }
}

/** Format a number for display (≤ 10 significant figures, no float noise). */
export function fmt(n) {
  if (n === Infinity) return '\\infty'
  if (n === -Infinity) return '-\\infty'
  if (Number.isNaN(n)) return '\\text{undefined}'
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return String(n)
  const s = math.format(n, { precision: 10, lowerExp: -6, upperExp: 15 })
  return s.replace(/e\+?(-?\d+)/, ' \\times 10^{$1}')
}

// ───────────── Angles: degrees or radians ─────────────

export const TRIG = ['sin', 'cos', 'tan', 'sec', 'csc', 'cot']
export const INVERSE_TRIG = ['asin', 'acos', 'atan']

const RAD = Math.PI / 180

/** Position of a whole-degree angle within one turn (0 ≤ r < 360), or null if not a whole number. */
const turn = (x) => (typeof x === 'number' && Number.isInteger(x) ? ((x % 360) + 360) % 360 : null)

/** Exact values at the quarter turns, where floating point would leave tiny errors (cos 90° = 6e-17). */
const QUARTER = {
  sin: { 0: 0, 90: 1, 180: 0, 270: -1 },
  cos: { 0: 1, 90: 0, 180: -1, 270: 0 },
  tan: { 0: 0, 90: null, 180: 0, 270: null },
}

function degreeFn(name) {
  return (x) => {
    const r = turn(x)
    if (r !== null && name in QUARTER && r in QUARTER[name]) {
      const v = QUARTER[name][r]
      if (v === null) {
        throw new ReckoningError(`The tangent of ${x}° is undefined, for the cosine there is nothing (cos ${x}° = 0).`)
      }
      return v
    }
    if (typeof x === 'number') return math[name](x * RAD)
    return math[name](math.multiply(x, RAD)) // complex angle
  }
}

/** Name a multiple of π/2 for the reader: π/2, −π/2, 3π/2 … */
const halfPiName = (q) => (q === 1 ? 'π/2' : q === -1 ? '−π/2' : `${q}π/2`)

/**
 * The radian functions, made exact at the quarter turns. The computer's π is a hair
 * short of the true π, so without this sin(π) comes out as 1.22 × 10⁻¹⁶ instead of 0.
 */
function radianFn(name) {
  return (x) => {
    if (typeof x === 'number' && Number.isFinite(x)) {
      const k = x / (Math.PI / 2)
      const q = Math.round(k)
      if (Math.abs(k - q) < 1e-10 * Math.max(1, Math.abs(q))) {
        const v = QUARTER[name][(((q % 4) + 4) % 4) * 90]
        if (v === null) {
          throw new ReckoningError(
            `The tangent of ${halfPiName(q)} is undefined, for the cosine there is nothing (cos ${halfPiName(q)} = 0).`,
          )
        }
        return v
      }
    }
    return math[name](x)
  }
}

function inverseDegreeFn(name) {
  return (x) => {
    const v = math[name](x)
    return typeof v === 'number' ? v / RAD : math.divide(v, RAD)
  }
}

/**
 * Functions that replace math.js's own sin, cos, tan …: in degrees, or in radians
 * made exact at the quarter turns. Passed to math.js as a scope, which takes
 * precedence over its built-in functions.
 */
export function angleScope(angle) {
  const scope = {}
  if (angle !== 'deg') {
    for (const f of Object.keys(QUARTER)) scope[f] = radianFn(f)
    return scope
  }
  for (const f of TRIG) scope[f] = degreeFn(f)
  for (const f of INVERSE_TRIG) scope[f] = inverseDegreeFn(f)
  return scope
}

/** Turn a typed degree sign into something the libraries understand. */
export function degreeSign(src, angle) {
  return angle === 'deg' ? src.replace(/°/g, '') : src.replace(/°/g, '*(pi/180)')
}

/** Format a complex number a + bi (dropping a part that is merely rounding noise). */
export function fmtComplex(re, im) {
  const tiny = (x, scale) => Math.abs(x) < 1e-12 * Math.max(1, Math.abs(scale))
  if (tiny(im, re)) return fmt(re)
  const mag = Math.abs(im)
  const imPart = mag === 1 ? 'i' : `${fmt(mag)}i`
  if (tiny(re, im)) return im < 0 ? `-${imPart}` : imPart
  return `${fmt(re)} ${im < 0 ? '-' : '+'} ${imPart}`
}

/** Split a mathjs value into { re, im } numbers. */
export function parts(v) {
  if (v && typeof v === 'object' && 're' in v) return { re: Number(v.re), im: Number(v.im) }
  return { re: Number(v), im: 0 }
}

/** Numeric value of a nerdamer result, or NaN if it is symbolic. */
export function valueOf(expr) {
  const s = String(expr)
  if (s === 'Inf' || s === 'Infinity') return Infinity
  if (s === '-Inf' || s === '-Infinity') return -Infinity
  try {
    const t = nerdamer(s).evaluate().text('decimals')
    const n = Number(t)
    if (!Number.isNaN(n)) return n
  } catch {
    /* fall through */
  }
  try {
    const v = math.evaluate(s)
    return typeof v === 'number' ? v : NaN
  } catch {
    return NaN
  }
}

/** True when a nerdamer result still contains an unevaluated operation. */
export function unevaluated(expr, op) {
  return new RegExp(`\\b${op}\\(`).test(String(expr))
}

/** Exact TeX of a value, plus "≈ decimal" when the exact form is not plain. */
export function exactWithApprox(expr) {
  const exact = tex(expr)
  const n = valueOf(expr)
  if (!Number.isFinite(n)) return exact
  const approx = fmt(n)
  if (approx === exact || /^-?\d+$/.test(String(expr).trim())) return exact
  return `${exact} \\approx ${approx}`
}

/** Do two functions agree numerically at a few sample points? */
export function sameFunction(a, b, v) {
  const fa = numericFn(a, v)
  const fb = numericFn(b, v)
  const pts = [0.37, 0.81, 1.29, 1.93, 2.47, -0.53, -1.71]
  let compared = 0
  for (const p of pts) {
    const x = fa(p)
    const y = fb(p)
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue
    compared++
    if (Math.abs(x - y) > 1e-6 * Math.max(1, Math.abs(x), Math.abs(y))) return false
  }
  return compared >= 2
}

/** Whether an expression string mentions the variable. */
export function hasVar(expr, v) {
  return new RegExp(`(^|[^a-zA-Z_])${v}([^a-zA-Z0-9_(]|$)`).test(String(expr))
}
