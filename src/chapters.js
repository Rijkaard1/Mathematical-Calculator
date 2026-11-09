// Each chapter of the "treatise" is one calculator mode.
// `example` fills the slate when the chapter is opened, so the reader
// sees a worked demonstration straight away.

export const CHAPTERS = [
  {
    id: 'arithmetic',
    numeral: 'I',
    latin: 'De Arithmetica',
    title: 'Of Arithmetick',
    blurb:
      'Wherein the four operations of number, together with powers, roots and the factorial, are set forth and reckoned — among the real numbers and, where these fail, among the imaginary.',
    initial: 'W',
    fields: [{ key: 'expr', label: 'Expression to be reckoned', placeholder: '(3 + 4) × 12 ÷ 7' }],
    example: { expr: '(3 + 4) × 12 ÷ 7' },
    hint: 'i is the imaginary unit (i² = −1), e.g. √(−4) or (3+2i)×(1−i). Angles are in radians; log is base 10, ln natural.',
  },
  {
    id: 'algebra',
    numeral: 'II',
    latin: 'De Algebra',
    title: 'Of Algebra',
    blurb:
      'Concerning the simplifying, expanding and factoring of expressions, and the solving of equations for the unknown quantity.',
    initial: 'C',
    actions: ['Solve', 'Simplify', 'Expand', 'Factor'],
    fields: [
      { key: 'expr', label: 'Expression or equation', placeholder: 'x^2 - 5x + 6 = 0' },
      { key: 'var', label: 'Unknown', placeholder: 'x', short: true, onlyFor: 'Solve' },
    ],
    example: { expr: 'x^2 - 5x + 6 = 0', var: 'x' },
    modeExamples: {
      Solve: 'x^2 - 5x + 6 = 0',
      Simplify: '(x^2 - 1) / (x - 1)',
      Expand: '(x + 1)^3',
      Factor: 'x^4 - 1',
    },
    hint: 'Write 2x or 2*x alike; ^ raiseth to a power. Where no real root existeth, the imaginary roots are given (x² + 1 = 0 → x = ±i).',
  },
  {
    id: 'derivative',
    numeral: 'III',
    latin: 'De Fluxionibus',
    title: 'Of Differentiation',
    blurb:
      'Of the method of fluxions: how the rate of change of a quantity may be found at every point of its course.',
    initial: 'O',
    fields: [
      { key: 'expr', label: 'Function f(x)', placeholder: 'x^2 · sin(x)' },
      { key: 'var', label: 'With respect to', placeholder: 'x', short: true },
      { key: 'order', label: 'Order', placeholder: '1', short: true },
    ],
    example: { expr: 'x^2 · sin(x)', var: 'x', order: '1' },
    hint: 'The order may be 1 to 10; 2 giveth the second fluxion.',
  },
  {
    id: 'integral',
    numeral: 'IV',
    latin: 'De Quadraturis',
    title: 'Of Integration',
    blurb:
      'Of quadratures, being the inverse of fluxions: the finding of areas beneath curves and of antiderivatives.',
    initial: 'O',
    actions: ['Indefinite', 'Definite'],
    fields: [
      { key: 'expr', label: 'Integrand f(x)', placeholder: 'x · e^x' },
      { key: 'var', label: 'Variable', placeholder: 'x', short: true },
      { key: 'lower', label: 'Lower bound', placeholder: '0', short: true, onlyFor: 'Definite' },
      { key: 'upper', label: 'Upper bound', placeholder: '1', short: true, onlyFor: 'Definite' },
    ],
    example: { expr: 'x · e^x', var: 'x', lower: '0', upper: '1' },
    hint: 'Bounds may be numbers, π/2, or ∞.',
  },
  {
    id: 'limit',
    numeral: 'V',
    latin: 'De Limitibus',
    title: 'Of Limits',
    blurb:
      'Of the value toward which a quantity tendeth as its variable approacheth a given point, from the left or from the right.',
    initial: 'O',
    actions: ['Both sides', 'From left', 'From right'],
    fields: [
      { key: 'expr', label: 'Function f(x)', placeholder: 'sin(x) / x' },
      { key: 'var', label: 'Variable', placeholder: 'x', short: true },
      { key: 'to', label: 'Approaching', placeholder: '0', short: true },
    ],
    example: { expr: 'sin(x) / x', var: 'x', to: '0' },
    hint: 'The point may be a number or ∞ (or −∞).',
  },
]

// The keys of the reckoning-tablet beneath the input.
export const KEYPAD = [
  ['7', '8', '9', '÷', '(', ')'],
  ['4', '5', '6', '×', '^', '√'],
  ['1', '2', '3', '−', 'π', 'e'],
  ['0', '.', '!', '+', 'x', 'i'],
  ['sin', 'cos', 'tan', 'ln', 'log', 'abs'],
  ['=', '∞', 'asin', 'acos', 'atan', '⌫'],
]
