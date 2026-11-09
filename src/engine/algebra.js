// Liber II — simplify, expand, factor and solve.
import nerdamer from 'nerdamer'
import { normalize, cleanVar, tex, parse, valueOf, fmt, hasVar, ReckoningError } from './common.js'

function splitEquation(src) {
  const parts = src.split('=')
  if (parts.length > 2) throw new ReckoningError('An equation may have but one sign of equality.')
  return parts.map((p) => p.trim())
}

function run(op, s) {
  try {
    return nerdamer(`${op}(${s})`).toString()
  } catch (e) {
    throw new ReckoningError(`The ${op} could not be performed: ${e.message}`)
  }
}

export function algebra({ expr, var: rawVar }, mode = 'Simplify') {
  const src = normalize(expr)
  if (!src) throw new ReckoningError('The slate is empty; inscribe an expression first.')

  if (mode === 'Solve') return solve(src, cleanVar(rawVar))

  if (src.includes('=')) {
    const verb = { Simplify: 'simplified', Expand: 'expanded', Factor: 'factored' }[mode] || 'simplified'
    throw new ReckoningError(`An equation is to be solved, not ${verb} — choose “Solve”, or remove the sign “=”.`)
  }
  const original = parse(src).toString()
  const given = tex(original)

  if (mode === 'Expand') {
    const r = run('expand', src)
    return {
      given,
      steps: [
        { note: 'Every product is multiplied out, and every power unfolded, by the distributive law', tex: `a(b+c) = ab + ac` },
        { note: 'Like terms being gathered together', tex: tex(r) },
      ],
      result: tex(r),
    }
  }

  if (mode === 'Factor') {
    const expanded = run('expand', src)
    const r = run('factor', src)
    const steps = []
    if (expanded !== original) steps.push({ note: 'First the expression is laid out in full', tex: tex(expanded) })
    steps.push(
      r === expanded
        ? { note: 'No common factor nor rational root is found; the expression is irreducible' }
        : { note: 'Common factors and rational roots being sought out, it is resolved into factors', tex: tex(r) },
    )
    return { given, steps, result: tex(r) }
  }

  // Simplify
  const r = run('simplify', src)
  const steps = []
  if (r === original) steps.push({ note: 'The expression standeth already in its simplest form' })
  else {
    steps.push({ note: 'Like terms are combined, common factors cancelled, and known identities applied', tex: tex(r) })
  }
  const n = valueOf(r)
  const result = Number.isFinite(n) && !/^-?\d+$/.test(r) ? `${tex(r)} \\approx ${fmt(n)}` : tex(r)
  return { given, steps, result }
}

function solve(src, v) {
  const [lhs, rhs = '0'] = splitEquation(src)
  if (!lhs) throw new ReckoningError('The left side of the equation is empty.')
  const zero = rhs === '0' ? lhs : `(${lhs})-(${rhs})`
  if (!hasVar(zero, v)) throw new ReckoningError(`The unknown “${v}” appeareth nowhere in the equation.`)

  const given = `${tex(lhs)} = ${tex(rhs)}`
  const steps = []

  let standard
  try {
    standard = nerdamer(`expand(${zero})`).toString()
  } catch {
    standard = parse(zero).toString()
  }
  if (rhs !== '0') steps.push({ note: 'All terms being brought to one side', tex: `${tex(standard)} = 0` })

  let factored = false
  try {
    const f = nerdamer(`factor(${standard})`).toString()
    if (f !== standard && /\)\s*\*|\*\s*\(|\)\^/.test(f)) {
      steps.push({ note: 'The polynomial is resolved into factors', tex: `${tex(f)} = 0` })
      steps.push({ note: 'A product vanisheth only when one of its factors vanisheth' })
      factored = true
    }
  } catch {
    /* not factorable */
  }

  // A quadratic that will not factor is solved by the formula, which shows
  // plainly when the roots must be sought among the imaginary numbers.
  let explainedImaginary = false
  if (!factored) {
    const q = quadraticSteps(standard, v)
    if (q) {
      steps.push(...q.steps)
      explainedImaginary = q.imaginary
    }
  }

  let roots
  try {
    roots = nerdamer.solve(src.includes('=') ? src : `${src}=0`, v)
  } catch (e) {
    throw new ReckoningError(`The equation could not be solved: ${e.message}`)
  }
  const list = roots
    .toString()
    .replace(/^[[{]|[\]}]$/g, '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (!list.length) {
    steps.push({ note: 'No value of the unknown satisfieth the equation' })
    return { given, steps, result: '\\text{No solution}' }
  }

  const real = list.filter((r) => !isComplexRoot(r))
  const complex = list.filter(isComplexRoot).map(complexParts)

  const shown = real.map((r) => {
    const n = valueOf(r)
    const exact = tex(r)
    const approx = Number.isFinite(n) && !/^-?\d+$/.test(r) ? ` \\approx ${fmt(n)}` : ''
    return `${v} = ${exact}${approx}`
  })
  shown.push(...pairConjugates(complex).map((c) => `${v} = ${c}`))

  if (list.some((r) => /_n/.test(r))) steps.push({ note: 'Here n standeth for any whole number' })
  if (complex.length && !explainedImaginary) {
    steps.push({
      note: real.length
        ? 'Some roots lie not among the real numbers but among the imaginary, where'
        : 'No real number satisfieth the equation; its roots lie among the imaginary numbers, where',
      tex: 'i = \\sqrt{-1}, \\qquad i^2 = -1',
    })
  }
  if (complex.length) {
    steps.push({ note: 'Imaginary roots of an equation with real coefficients come in conjugate pairs, a + bi and a − bi' })
  }

  return { given, steps, result: shown.join(',\\quad ') }
}

// ───────────── Imaginary roots ─────────────

const isComplexRoot = (r) => /(^|[^a-zA-Z_])i([^a-zA-Z_]|$)/.test(r) && !/_n/.test(r)

const neg = (s) => nerdamer(`-(${s})`).toString()

function complexParts(r) {
  const re = nerdamer(`realpart(${r})`).toString()
  const im = nerdamer(`imagpart(${r})`).toString()
  return { re, im, reV: valueOf(re), imV: valueOf(im) }
}

/** TeX of b·i for a positive coefficient b. */
function imTex(b) {
  if (b === '1') return 'i'
  const t = tex(b)
  return /[+-]/.test(t.replace(/^-/, '')) ? `\\left(${t}\\right) i` : `${t}\\,i`
}

const plain = (s) => /^-?\d+$/.test(s)

/** Write imaginary roots as a ± bi, joining each root with its conjugate. */
function pairConjugates(roots) {
  const out = []
  const used = new Set()
  roots.forEach((r, k) => {
    if (used.has(k)) return
    used.add(k)
    const mate = roots.findIndex(
      (o, j) => !used.has(j) && Math.abs(o.reV - r.reV) < 1e-12 && Math.abs(o.imV + r.imV) < 1e-12,
    )
    const b = r.imV < 0 ? neg(r.im) : r.im
    const reZero = Math.abs(r.reV) < 1e-15
    const head = reZero ? '' : `${tex(r.re)} `
    let exact
    if (mate >= 0) {
      used.add(mate)
      exact = `${head}\\pm ${imTex(b)}`
    } else {
      exact = `${head}${r.imV < 0 ? '-' : reZero ? '' : '+'} ${imTex(b)}`
    }
    const tidy = plain(r.re) && plain(b)
    const sign = mate >= 0 ? '\\pm' : r.imV < 0 ? '-' : '+'
    const approx = tidy ? '' : ` \\approx ${reZero ? '' : `${fmt(r.reV)} `}${sign} ${fmt(Math.abs(r.imV))}i`
    out.push(`${exact}${approx}`)
  })
  return out
}

/** Steps of the quadratic formula for a·x² + b·x + c = 0 with numeric coefficients. */
function quadraticSteps(poly, v) {
  let c, b, a
  try {
    if (nerdamer(`deg(${poly}, ${v})`).toString() !== '2') return null
    ;[c, b, a] = nerdamer.coeffs(poly, v).toString().replace(/^\[|\]$/g, '').split(',').map((s) => s.trim())
  } catch {
    return null
  }
  if ([a, b, c].some((k) => !Number.isFinite(valueOf(k)))) return null
  const disc = nerdamer(`(${b})^2-4*(${a})*(${c})`).toString()
  const d = valueOf(disc)
  const steps = [
    {
      note: 'By the formula for the quadratic',
      tex: `${v} = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}, \\quad \\Delta = b^2 - 4ac, \\quad a = ${tex(a)},\\; b = ${tex(b)},\\; c = ${tex(c)}`,
    },
    { note: 'The discriminant is', tex: `\\Delta = \\left(${tex(b)}\\right)^2 - 4\\left(${tex(a)}\\right)\\left(${tex(c)}\\right) = ${tex(disc)}` },
  ]
  if (d < 0) {
    const root = nerdamer(`sqrt(${neg(disc)})`).toString()
    steps.push({
      note: 'The discriminant being negative, no real number satisfieth the equation. Its square root is imaginary',
      tex: `\\sqrt{${tex(disc)}} = \\sqrt{${tex(neg(disc))}}\\cdot\\sqrt{-1} = ${imTex(root)}, \\qquad i^2 = -1`,
    })
    steps.push({
      note: 'Whence',
      tex: `${v} = \\dfrac{${tex(neg(b))} \\pm ${imTex(root)}}{${tex(nerdamer(`2*(${a})`).toString())}}`,
    })
    return { steps, imaginary: true }
  }
  if (d === 0) steps.push({ note: 'The discriminant being nothing, the two roots coincide' })
  else steps.push({ note: 'The discriminant being positive, there are two real roots' })
  return { steps, imaginary: false }
}
