// Liber I — arithmetic, worked one operation at a time in the order of operations.
import { math, normalize, fmt, fmtComplex, parts, ReckoningError } from './common.js'

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

const CONSTANTS = new Set(['pi', 'e', 'i', 'Infinity', 'phi', 'tau'])

/** A leaf that already holds a number (or a named constant). */
function isLeaf(n) {
  if (n.isConstantNode) return true
  if (n.isSymbolNode && CONSTANTS.has(n.name)) return true
  if (n.isParenthesisNode) return isLeaf(n.content)
  // A negative number such as −4 is one number, not an operation to perform.
  if (n.isOperatorNode && n.fn === 'unaryMinus' && n.args[0].isConstantNode) return true
  return isComplexLiteral(n)
}

/** A complex number as written, such as 3 + 2i, 2i or 1 − i: one number, not a sum to work out. */
function isComplexLiteral(n) {
  let constants = 0
  let units = 0
  let ok = true
  n.traverse((c) => {
    // A complex constant was computed by an earlier step, so it is not as written.
    if (c.isConstantNode && typeof c.value === 'object') ok = false
    else if (c.isConstantNode) constants++
    else if (c.isSymbolNode && c.name === 'i') units++
    else if (c.isParenthesisNode) return
    else if (!(c.isOperatorNode && ['add', 'subtract', 'multiply', 'unaryMinus'].includes(c.fn))) ok = false
  })
  return ok && units === 1 && constants <= 2
}

// Trim floating-point noise such as 0.30000000000000004
const clean = (x) => (Number.isFinite(x) && !Number.isInteger(x) ? Number(x.toPrecision(14)) : x)

const isImaginary = ({ re, im }) => Math.abs(im) > 1e-12 * Math.max(1, Math.abs(re))

/** A number as a tree node: real numbers plainly, complex ones as (a + bi). */
function toConstant(value) {
  const p = parts(value)
  if (isImaginary(p)) {
    const re = Math.abs(p.re) < 1e-12 * Math.abs(p.im) ? 0 : clean(p.re)
    return new ParenthesisNode(new ConstantNode(math.complex(re, clean(p.im))))
  }
  const v = clean(p.re)
  const c = new ConstantNode(v)
  return v < 0 ? new ParenthesisNode(c) : c
}

const valueOfLeaf = (n) => (n.isParenthesisNode ? valueOfLeaf(n.content) : n.value)

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

  if (isLeaf(node)) return { node, changed: false }
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
      let value = node.evaluate()
      // An odd root of a negative number has a real value: (−8)^(1/3) = −2.
      if (node.isOperatorNode && node.fn === 'pow') {
        const base = parts(node.args[0].evaluate())
        const exp = parts(node.args[1].evaluate())
        const n = 1 / exp.re
        if (!isImaginary(base) && !isImaginary(exp) && base.re < 0 && Math.abs(n - Math.round(n)) < 1e-9 && Math.round(n) % 2 !== 0) {
          value = -Math.pow(-base.re, exp.re)
        }
      }
      const name = node.isOperatorNode ? OP_NAMES[node.fn] : FN_NAMES[node.fn.name ?? node.name]
      const result = toConstant(value)
      const out = parts(valueOfLeaf(result))
      // A real operation yielding an imaginary result (e.g. √−4) deserves remark.
      const inputsReal = node.args.every((a) => {
        try {
          return !isImaginary(parts(a.evaluate()))
        } catch {
          return true
        }
      })
      return {
        node: result,
        changed: true,
        bornImaginary: inputsReal && isImaginary(out),
        sub: {
          name: name || `the function ${node.name || node.fn}`,
          tex: `${node.toTex()} = ${fmtComplex(out.re, out.im)}`,
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
    if (r.bornImaginary && !steps.some((s) => s.imaginary)) {
      steps.push({
        note: 'This quantity hath no value among the real numbers, so it is sought among the imaginary numbers, where',
        tex: 'i = \\sqrt{-1}, \\qquad i^2 = -1',
        imaginary: true,
      })
    }
    steps.push({ note: `Performing ${r.sub.name}`, sub: r.sub.tex, tex: whole })
  }

  // Constants standing alone (π, e, i) still need a value.
  let raw
  try {
    raw = node.evaluate()
  } catch (e) {
    throw new ReckoningError(e.message)
  }
  const p = parts(raw)
  if (Number.isNaN(p.re) || Number.isNaN(p.im)) throw new ReckoningError('The result is not a number (perchance 0 ÷ 0).')
  if (isImaginary(p)) {
    if (!steps.length) steps.push({ note: 'The quantity standeth already in its simplest form' })
    return { given, steps, result: fmtComplex(clean(p.re), clean(p.im)) }
  }
  const value = p.re

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
