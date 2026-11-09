// Liber I — arithmetic, worked one operation at a time in the order of operations.
import { math, normalize, fmt, ReckoningError } from './common.js'

const { ConstantNode, ParenthesisNode } = math

const OP_NAMES = {
  add: 'the addition',
  subtract: 'the subtraction',
  multiply: 'the multiplication',
  divide: 'the division',
  pow: 'the raising to a power',
  factorial: 'the factorial',
  unaryMinus: 'the negation',
  mod: 'the remainder',
}

const FN_NAMES = {
  sqrt: 'the square root',
  cbrt: 'the cube root',
  nthRoot: 'the root',
  sin: 'the sine',
  cos: 'the cosine',
  tan: 'the tangent',
  sec: 'the secant',
  csc: 'the cosecant',
  cot: 'the cotangent',
  asin: 'the arc-sine',
  acos: 'the arc-cosine',
  atan: 'the arc-tangent',
  log: 'the natural logarithm',
  log10: 'the common logarithm',
  exp: 'the exponential',
  abs: 'the absolute value',
}

const CONSTANTS = new Set(['pi', 'e', 'Infinity', 'phi', 'tau'])

/** A leaf that already holds a number (or a named constant). */
function isLeaf(n) {
  if (n.isConstantNode) return true
  if (n.isSymbolNode && CONSTANTS.has(n.name)) return true
  if (n.isParenthesisNode) return isLeaf(n.content)
  return false
}

function toConstant(value) {
  let v = value
  if (v && typeof v === 'object' && 're' in v) {
    if (Math.abs(v.im) > 1e-12) {
      throw new ReckoningError(
        'The reckoning leadeth to an imaginary quantity (such as the root of a negative number), which this chapter doth not treat.',
      )
    }
    v = v.re
  }
  if (typeof v !== 'number') v = Number(v)
  // Trim floating-point noise such as 0.30000000000000004
  if (Number.isFinite(v) && !Number.isInteger(v)) v = Number(v.toPrecision(14))
  const c = new ConstantNode(v)
  return v < 0 ? new ParenthesisNode(c) : c
}

/**
 * Evaluate the first innermost operation whose operands are all numbers.
 * Returns { node, changed, sub } where `sub` describes the operation performed.
 */
function reduceOnce(node) {
  if (node.isParenthesisNode) {
    const r = reduceOnce(node.content)
    if (!r.changed) return { node, changed: false }
    const inner = r.node
    const bare = inner.isConstantNode || (inner.isParenthesisNode && inner.content.isConstantNode)
    return { ...r, node: bare ? inner : new ParenthesisNode(inner) }
  }

  if (node.isOperatorNode || node.isFunctionNode) {
    for (let i = 0; i < node.args.length; i++) {
      const r = reduceOnce(node.args[i])
      if (r.changed) {
        const copy = node.clone()
        copy.args = node.args.slice()
        copy.args[i] = r.node
        return { ...r, node: copy }
      }
    }
    if (node.args.every(isLeaf)) {
      const value = node.evaluate()
      const name = node.isOperatorNode ? OP_NAMES[node.fn] : FN_NAMES[node.fn.name ?? node.name]
      const result = toConstant(value)
      return {
        node: result,
        changed: true,
        sub: {
          name: name || `the function ${node.name || node.fn}`,
          tex: `${node.toTex()} = ${fmt(result.isParenthesisNode ? result.content.value : result.value)}`,
        },
      }
    }
  }
  return { node, changed: false }
}

export function arithmetic({ expr }) {
  const src = normalize(expr)
  if (!src) throw new ReckoningError('The slate is empty; inscribe an expression first.')

  let node
  try {
    node = math.parse(src)
  } catch (e) {
    throw new ReckoningError(`The expression could not be read: ${e.message}`)
  }

  const unknowns = node
    .filter((n) => n.isSymbolNode && !CONSTANTS.has(n.name) && !math[n.name])
    .map((n) => n.name)
  if (unknowns.length) {
    throw new ReckoningError(
      `Arithmetick admitteth no unknown quantities (“${unknowns[0]}”). Turn to Liber II, De Algebra.`,
    )
  }

  const given = node.toTex()
  const steps = []
  let seen = given
  for (let i = 0; i < 60; i++) {
    const r = reduceOnce(node)
    if (!r.changed) break
    node = r.node
    const whole = node.toTex()
    if (whole === seen) continue
    seen = whole
    steps.push({ note: `Performing ${r.sub.name}`, sub: r.sub.tex, tex: whole })
  }

  // Constants standing alone (π, e) still need a value.
  let value
  try {
    value = node.evaluate()
  } catch (e) {
    throw new ReckoningError(e.message)
  }
  if (value && typeof value === 'object' && 're' in value) {
    if (Math.abs(value.im) > 1e-12) throw new ReckoningError('The result is an imaginary quantity.')
    value = value.re
  }
  value = Number(value)
  if (Number.isNaN(value)) throw new ReckoningError('The result is not a number (perchance 0 ÷ 0).')

  let result = fmt(value)
  // Offer an exact fraction when the decimal is a tidy rational.
  if (Number.isFinite(value) && !Number.isInteger(value) && String(value).length > 8 && !/pi|e\b|sqrt|sin|cos|tan|log/.test(src)) {
    try {
      const f = math.fraction(value)
      const d = Number(f.d)
      if (d > 1 && d <= 10000 && Math.abs(Number(f.s) * Number(f.n) / d - value) < 1e-12) {
        result = `${Number(f.s) < 0 ? '-' : ''}\\dfrac{${f.n}}{${f.d}} \\approx ${fmt(value)}`
      }
    } catch {
      /* no tidy fraction */
    }
  }
  if (value === Infinity || value === -Infinity) {
    steps.push({ note: 'A quantity divided by nothing groweth without bound' })
  }
  if (!steps.length) steps.push({ note: 'The quantity standeth already in its simplest form' })

  return { given, steps, result }
}
