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

  try {
    const f = nerdamer(`factor(${standard})`).toString()
    if (f !== standard && /\)\s*\*|\*\s*\(|\)\^/.test(f)) {
      steps.push({ note: 'The polynomial is resolved into factors', tex: `${tex(f)} = 0` })
      steps.push({ note: 'A product vanisheth only when one of its factors vanisheth' })
    }
  } catch {
    /* not factorable */
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

  const shown = list.map((r) => {
    const n = valueOf(r)
    const exact = tex(r)
    const approx = Number.isFinite(n) && !/^-?\d+$/.test(r) ? ` \\approx ${fmt(n)}` : ''
    return `${v} = ${exact}${approx}`
  })
  if (list.some((r) => /_n/.test(r))) steps.push({ note: 'Here n standeth for any whole number' })
  if (list.some((r) => /\bi\b/.test(r))) steps.push({ note: 'Some roots are imaginary, i being the square root of −1' })

  return { given, steps, result: shown.join(',\\quad ') }
}
