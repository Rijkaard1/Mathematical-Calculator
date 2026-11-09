// Liber III — differentiation, naming the rule applied at each stage.
import nerdamer from 'nerdamer'
import { math, normalize, cleanVar, tex, writtenTex, parse, hasVar, ReckoningError } from './common.js'

/** mathjs node → string nerdamer can read. */
export const str = (node) => node.toString({ implicit: 'show', parenthesis: 'auto' })

export function diff(expr, v) {
  try {
    return nerdamer.diff(expr, v).toString()
  } catch (e) {
    throw new ReckoningError(`The fluxion could not be taken: ${e.message}`)
  }
}

/** Reduce to a tidier form when nerdamer can, otherwise leave as is. */
export function tidy(expr) {
  try {
    const s = nerdamer(`simplify(${expr})`).toString()
    return s.length <= 0.8 * String(expr).length ? s : String(expr)
  } catch {
    return String(expr)
  }
}

const strip = (n) => (n.isParenthesisNode ? strip(n.content) : n)
const D = (v, t) => `\\dfrac{d}{d${v}}\\!\\left[${t}\\right]`
const isVar = (n, v) => n.isSymbolNode && n.name === v

/** Collect the terms of a sum, keeping their signs. */
function terms(node, sign = 1, out = []) {
  const n = strip(node)
  if (n.isOperatorNode && n.fn === 'add') {
    terms(n.args[0], sign, out)
    terms(n.args[1], sign, out)
  } else if (n.isOperatorNode && n.fn === 'subtract') {
    terms(n.args[0], sign, out)
    terms(n.args[1], -sign, out)
  } else out.push({ sign, node: n })
  return out
}

function joinSigned(items) {
  return items.map((t, i) => (t.sign < 0 ? ' - ' : i ? ' + ' : '') + t.tex).join('')
}

const TABLE = {
  sin: '\\cos u', cos: '-\\sin u', tan: '\\sec^2 u', sec: '\\sec u \\tan u', csc: '-\\csc u \\cot u',
  cot: '-\\csc^2 u', log: '\\tfrac{1}{u}', log10: '\\tfrac{1}{u \\ln 10}', exp: 'e^{u}',
  sqrt: '\\tfrac{1}{2\\sqrt{u}}', asin: '\\tfrac{1}{\\sqrt{1-u^2}}', acos: '-\\tfrac{1}{\\sqrt{1-u^2}}',
  atan: '\\tfrac{1}{1+u^2}',
}

/**
 * Describe the one rule that governs the outermost form of `node`.
 * Returns an array of { note, tex } steps (without the final answer).
 */
export function explainDerivative(node, v) {
  const n = strip(node)
  const s = str(n)
  const T = (x) => tex(typeof x === 'string' ? x : str(x))
  const d = (x) => diff(typeof x === 'string' ? x : str(x), v)

  if (!hasVar(s, v)) return [{ note: 'The quantity being constant, its fluxion is nothing', tex: `${D(v, T(n))} = 0` }]
  if (isVar(n, v)) return [{ note: 'The fluxion of the variable itself is unity', tex: `${D(v, v)} = 1` }]

  if (n.isOperatorNode && (n.fn === 'add' || n.fn === 'subtract')) {
    const ts = terms(n)
    return [
      {
        note: 'By the rule of sums, each term is differentiated apart',
        tex: joinSigned(ts.map((t) => ({ sign: t.sign, tex: D(v, T(t.node)) }))),
      },
      {
        note: 'Which yieldeth, term by term',
        tex: joinSigned(ts.map((t) => ({ sign: t.sign, tex: `\\left(${tex(d(t.node))}\\right)` }))),
      },
    ]
  }

  if (n.isOperatorNode && n.fn === 'unaryMinus') {
    return [{ note: 'The sign passeth through the fluxion', tex: `-${D(v, T(n.args[0]))} = -\\left(${tex(d(n.args[0]))}\\right)` }]
  }

  if (n.isOperatorNode && n.fn === 'multiply') {
    const [a, b] = n.args.map(strip)
    const ca = !hasVar(str(a), v)
    const cb = !hasVar(str(b), v)
    if (ca || cb) {
      const [c, u] = ca ? [a, b] : [b, a]
      return [{ note: 'A constant factor passeth through the fluxion', tex: `${T(c)} \\cdot ${D(v, T(u))} = ${T(c)} \\cdot \\left(${tex(d(u))}\\right)` }]
    }
    return [
      { note: 'By the rule of the product', tex: `(uv)' = u'v + uv', \\quad u = ${T(a)},\\; v = ${T(b)}` },
      { note: 'The fluxions of the factors being', tex: `u' = ${tex(d(a))}, \\quad v' = ${tex(d(b))}` },
      { note: 'Whence', tex: `\\left(${tex(d(a))}\\right)\\left(${T(b)}\\right) + \\left(${T(a)}\\right)\\left(${tex(d(b))}\\right)` },
    ]
  }

  if (n.isOperatorNode && n.fn === 'divide') {
    const [a, b] = n.args.map(strip)
    if (!hasVar(str(b), v)) {
      return [{ note: 'Division by a constant passeth through the fluxion', tex: `\\dfrac{1}{${T(b)}} ${D(v, T(a))} = \\dfrac{${tex(d(a))}}{${T(b)}}` }]
    }
    return [
      { note: 'By the rule of the quotient', tex: `\\left(\\dfrac{u}{v}\\right)' = \\dfrac{u'v - uv'}{v^2}, \\quad u = ${T(a)},\\; v = ${T(b)}` },
      { note: 'The fluxions of the parts being', tex: `u' = ${tex(d(a))}, \\quad v' = ${tex(d(b))}` },
      { note: 'Whence', tex: `\\dfrac{\\left(${tex(d(a))}\\right)\\left(${T(b)}\\right) - \\left(${T(a)}\\right)\\left(${tex(d(b))}\\right)}{\\left(${T(b)}\\right)^2}` },
    ]
  }

  if (n.isOperatorNode && n.fn === 'pow') {
    const [base, exp] = n.args.map(strip)
    const vb = hasVar(str(base), v)
    const ve = hasVar(str(exp), v)
    if (vb && !ve) {
      if (isVar(base, v)) {
        return [{ note: 'By the rule of powers', tex: `${D(v, `${v}^{n}`)} = n\\,${v}^{n-1}, \\quad n = ${T(exp)}` }]
      }
      return [
        { note: 'By the rule of powers joined with the rule of the chain', tex: `\\left(u^{n}\\right)' = n\\,u^{n-1}\\,u', \\quad u = ${T(base)},\\; n = ${T(exp)}` },
        { note: 'The inner fluxion being', tex: `u' = ${tex(d(base))}` },
      ]
    }
    if (!vb && ve) {
      return [
        { note: 'By the rule of exponentials (with the chain)', tex: `\\left(a^{u}\\right)' = a^{u} \\ln a \\cdot u', \\quad a = ${T(base)},\\; u = ${T(exp)}` },
        { note: 'The inner fluxion being', tex: `u' = ${tex(d(exp))}` },
      ]
    }
    return [
      { note: 'Variable in both base and exponent: by logarithmic differentiation', tex: `y = ${T(n)} \\;\\Rightarrow\\; \\ln y = ${T(exp)} \\ln\\left(${T(base)}\\right)` },
      { note: 'Differentiating both sides and multiplying through by y', tex: `y' = y \\cdot ${D(v, `${T(exp)} \\ln\\left(${T(base)}\\right)`)}` },
    ]
  }

  if (n.isFunctionNode) {
    const name = n.fn.name ?? n.name
    const arg = strip(n.args[0] ?? n)
    if (isVar(arg, v)) {
      return [{ note: 'From the table of fluxions', tex: `${D(v, T(n))} = ${tex(d(n))}` }]
    }
    const outer = TABLE[name] ? `, \\quad f'(u) =${TABLE[name]}` : ''
    return [
      { note: 'By the rule of the chain', tex: `\\left(f(u)\\right)' = f'(u) \\cdot u', \\quad u = ${T(arg)}${outer}` },
      { note: 'The inner fluxion being', tex: `u' = ${tex(d(arg))}` },
    ]
  }

  return []
}

export function derivative({ expr, var: rawVar, order }) {
  const v = cleanVar(rawVar)
  const src = normalize(expr)
  if (!src) throw new ReckoningError('The slate is empty; inscribe a function first.')
  if (src.includes('=')) throw new ReckoningError('Inscribe a function, not an equation.')

  const k = order === undefined || String(order).trim() === '' ? 1 : Number(order)
  if (!Number.isInteger(k) || k < 1 || k > 10) throw new ReckoningError('The order must be a whole number from 1 to 10.')

  const f = parse(src).toString()
  let node
  try {
    node = math.parse(src)
  } catch {
    node = null
  }

  const dd = k === 1 ? `\\dfrac{d}{d${v}}` : `\\dfrac{d^{${k}}}{d${v}^{${k}}}`
  const given = `${dd}\\left[${writtenTex(src)}\\right]`

  const steps = []
  if (node) {
    try {
      steps.push(...explainDerivative(node, v))
    } catch {
      /* rule description is a courtesy; the answer below still stands */
    }
  }

  let current = diff(f, v)
  current = tidy(current)
  steps.push({ note: k === 1 ? 'Being gathered and reduced' : 'The first fluxion, reduced', tex: `f'(${v}) = ${tex(current)}` })

  const primes = ["'", "''", "'''"]
  for (let i = 2; i <= k; i++) {
    current = tidy(diff(current, v))
    const label = i <= 3 ? `f${primes[i - 1]}(${v})` : `f^{(${i})}(${v})`
    steps.push({ note: `Differentiating once more, the fluxion of order ${i}`, tex: `${label} = ${tex(current)}` })
  }

  return { given, steps, result: tex(current) }
}
