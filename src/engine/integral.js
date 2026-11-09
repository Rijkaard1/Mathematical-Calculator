// Liber IV — integration (quadratures), indefinite and definite.
import nerdamer from 'nerdamer'
import {
  math, normalize, cleanVar, tex, writtenTex, parse, hasVar, numericFn, evalNumber, valueOf, fmt,
  sameFunction, unevaluated, ReckoningError,
} from './common.js'
import { diff, tidy, str } from './derivative.js'

const strip = (n) => (n.isParenthesisNode ? strip(n.content) : n)
const I = (t, v) => `\\int ${t}\\,d${v}`

/** The integrand as written, bracketed when it is a sum. */
function integrandTex(src) {
  const t = writtenTex(src)
  try {
    const n = strip(math.parse(src))
    if (n.isOperatorNode && (n.fn === 'add' || n.fn === 'subtract')) return `\\left(${t}\\right)`
  } catch {
    /* as written */
  }
  return t
}

function isPolynomial(node, v) {
  try {
    return nerdamer(`deg(${str(node)}, ${v})`).toString() !== '' && !/sin|cos|tan|log|e\^|exp|sqrt/.test(str(node))
  } catch {
    return false
  }
}

/** Name the method that governs the outermost form, where it can be told with confidence. */
function explain(node, v) {
  const n = strip(node)
  const s = str(n)
  const T = (x) => tex(str(x))
  if (n.isOperatorNode && (n.fn === 'add' || n.fn === 'subtract') && n.args.length === 2) {
    const op = n.fn === 'add' ? '+' : '-'
    return [{ note: 'The integral of a sum is the sum of the integrals', tex: `${I(T(n.args[0]), v)} ${op} ${I(`\\left(${T(n.args[1])}\\right)`, v)}` }]
  }
  if (n.isOperatorNode && n.fn === 'multiply') {
    const [a, b] = n.args.map(strip)
    const ca = !hasVar(str(a), v)
    const cb = !hasVar(str(b), v)
    if (ca || cb) {
      const [c, u] = ca ? [a, b] : [b, a]
      return [{ note: 'A constant factor is brought before the sign of integration', tex: `${T(c)} ${I(T(u), v)}` }]
    }
    const transcendental = (x) => /sin|cos|log|exp|e \^|\be\b/.test(str(x))
    if ((isPolynomial(a, v) && transcendental(b)) || (isPolynomial(b, v) && transcendental(a))) {
      return [{ note: 'A polynomial multiplying a transcendental quantity: by integration in parts', tex: `\\int u\\,dv = uv - \\int v\\,du` }]
    }
  }
  if (n.isOperatorNode && n.fn === 'pow' && n.args[0].isSymbolNode && n.args[0].name === v && !hasVar(str(n.args[1]), v)) {
    const e = str(n.args[1])
    if (valueOf(e) === -1) return [{ note: 'The reciprocal of the variable integrateth to the logarithm', tex: `${I(`${v}^{-1}`, v)} = \\ln|${v}| + C` }]
    return [{ note: 'By the rule of powers', tex: `${I(`${v}^{n}`, v)} = \\dfrac{${v}^{n+1}}{n+1} + C, \\quad n = ${tex(e)}` }]
  }
  if (n.isOperatorNode && n.fn === 'divide' && !hasVar(str(n.args[1]), v)) {
    return [{ note: 'A constant divisor is brought before the sign of integration', tex: `\\dfrac{1}{${T(n.args[1])}} ${I(T(n.args[0]), v)}` }]
  }
  if (n.isFunctionNode && strip(n.args[0])?.isSymbolNode && strip(n.args[0]).name === v) {
    return [{ note: 'From the table of quadratures' }]
  }
  if (!hasVar(s, v)) return [{ note: 'The integrand being constant, it is multiplied by the variable' }]
  return []
}

function antiderivative(f, v) {
  let F
  try {
    F = nerdamer.integrate(f, v).toString()
  } catch {
    return null
  }
  if (unevaluated(F, 'integrate')) return null
  // Prove it: differentiating F must give back f.
  try {
    if (!sameFunction(diff(F, v), f, v)) return null
  } catch {
    return null
  }
  return F
}

/** Composite Simpson's rule on [a, b]; returns NaN if the integrand misbehaves. */
function simpson(f, a, b, n = 2000) {
  const h = (b - a) / n
  let s = f(a) + f(b)
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h)
  const r = (s * h) / 3
  return Number.isFinite(r) ? r : NaN
}

/** Midpoint rule: never touches the ends, so it serves when an end is singular (e.g. 1/√x at 0). */
function midpoint(f, a, b, n = 200000) {
  const h = (b - a) / n
  let s = 0
  for (let i = 0; i < n; i++) s += f(a + (i + 0.5) * h)
  const r = s * h
  return Number.isFinite(r) ? r : NaN
}

/** Strings like 10533759911871435867/25000000000000000000 are decimals in disguise. */
const huge = (s) => /\d{13,}/.test(String(s))

function boundaryValue(F, v, bound) {
  const b = normalize(bound)
  if (/^-?Infinity$/.test(b)) {
    const r = nerdamer(`limit(${F}, ${v}, ${b})`).toString()
    if (unevaluated(r, 'limit')) throw new ReckoningError('The value of the antiderivative at infinity could not be found.')
    return r
  }
  return nerdamer(F, { [v]: `(${b})` }).toString()
}

export function integral({ expr, var: rawVar, lower, upper }, mode = 'Indefinite') {
  const v = cleanVar(rawVar)
  const src = normalize(expr)
  if (!src) throw new ReckoningError('The slate is empty; inscribe an integrand first.')
  if (src.includes('=')) throw new ReckoningError('Inscribe an integrand, not an equation.')
  const f = parse(src).toString()

  let node = null
  try {
    node = math.parse(src)
  } catch {
    /* no rule description */
  }
  const steps = node ? explain(node, v) : []
  const F = antiderivative(f, v)

  if (mode === 'Indefinite') {
    const given = I(integrandTex(src), v)
    if (!F) {
      steps.push({ note: 'No antiderivative in finite terms of the common functions is known for this integrand' })
      return { given, steps, result: '\\text{No elementary antiderivative}' }
    }
    steps.push({ note: 'The antiderivative is found', tex: `F(${v}) = ${tex(F)}` })
    steps.push({ note: 'Proof: differentiating F returneth the integrand', tex: `F'(${v}) = ${tex(f)}` })
    return { given, steps, result: `${tex(F)} + C` }
  }

  // Definite
  if (String(lower ?? '').trim() === '' || String(upper ?? '').trim() === '') {
    throw new ReckoningError('Both bounds of the definite integral must be given.')
  }
  const a = evalNumber(lower)
  const b = evalNumber(upper)
  const given = `\\int_{${tex(normalize(lower))}}^{${tex(normalize(upper))}} ${integrandTex(src)}\\,d${v}`
  const fn = numericFn(src, v)
  const finite = Number.isFinite(a) && Number.isFinite(b)
  const endSingular = finite && (!Number.isFinite(fn(a)) || !Number.isFinite(fn(b)))
  // A pole strictly inside the interval makes the integral improper.
  let interiorPole = false
  if (finite) {
    for (let i = 1; i < 4000 && !interiorPole; i++) {
      if (!Number.isFinite(fn(a + ((b - a) * i) / 4000))) interiorPole = true
    }
  }
  const numeric = !finite || interiorPole ? NaN : endSingular ? midpoint(fn, a, b) : simpson(fn, a, b)

  if (F && !interiorPole) {
    try {
      const Fb = boundaryValue(F, v, upper)
      const Fa = boundaryValue(F, v, lower)
      const exact = tidy(nerdamer(`(${Fb})-(${Fa})`).toString())
      const value = valueOf(exact)
      // Quadrature is coarse beside an end singularity, so the tolerance widens there.
      const tol = endSingular ? 2e-2 : 1e-5
      const agrees = !finite || (Number.isFinite(numeric) && Math.abs(value - numeric) < tol * Math.max(1, Math.abs(value)))
      if (Number.isFinite(value) && agrees) {
        const lo = tex(normalize(lower))
        const hi = tex(normalize(upper))
        steps.push({ note: 'The antiderivative is found', tex: `F(${v}) = ${tex(F)}` })
        if (huge(Fb) || huge(Fa) || huge(exact)) {
          steps.push({
            note: 'By the fundamental theorem, the value is the difference of F at the bounds',
            tex: `\\Big[F(${v})\\Big]_{${lo}}^{${hi}} = F\\!\\left(${hi}\\right) - F\\!\\left(${lo}\\right)`,
          })
          return { given, steps, result: `\\approx ${fmt(value)}` }
        }
        steps.push({
          note: 'By the fundamental theorem, the value is the difference of F at the bounds',
          tex: `\\Big[F(${v})\\Big]_{${lo}}^{${hi}} = \\left(${tex(Fb)}\\right) - \\left(${tex(Fa)}\\right)`,
        })
        const approx = /^-?\d+$/.test(exact) ? '' : ` \\approx ${fmt(value)}`
        return { given, steps, result: `${tex(exact)}${approx}` }
      }
    } catch (e) {
      if (e instanceof ReckoningError && !finite) throw e
    }
  }

  if (!finite) throw new ReckoningError('This improper integral could not be determined.')
  if (!Number.isFinite(numeric)) {
    throw new ReckoningError('The integrand is unbounded or undefined upon the interval; the integral is improper and may diverge.')
  }
  steps.push(
    endSingular
      ? {
          note: 'The integrand being unbounded at an end, the area is measured by the rule of midpoints, which toucheth not the ends',
          tex: `\\int_a^b f\\,d${v} \\approx h\\sum_{i} f\\!\\left(a + \\left(i + \\tfrac12\\right)h\\right)`,
        }
      : {
          note: 'No antiderivative serving, the area is measured by the method of quadratures (Simpson’s rule, 2000 strips)',
          tex: `\\int_a^b f\\,d${v} \\approx \\tfrac{h}{3}\\left[f_0 + 4f_1 + 2f_2 + \\cdots + f_n\\right]`,
        },
  )
  return { given, steps, result: `\\approx ${fmt(numeric)}` }
}
