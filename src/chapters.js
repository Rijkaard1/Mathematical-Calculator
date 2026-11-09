// Each chapter of the "treatise" is one calculator mode.
// `sample` is a demonstration plate shown during the design stage;
// the real computation engine replaces it in the next stage.

export const CHAPTERS = [
  {
    id: 'arithmetic',
    numeral: 'I',
    latin: 'De Arithmetica',
    title: 'Of Arithmetick',
    blurb:
      'Wherein the four operations of number, together with powers, roots and the factorial, are set forth and reckoned.',
    initial: 'A',
    fields: [{ key: 'expr', label: 'Expression to be reckoned', placeholder: '(3 + 4) × 12 ÷ 7' }],
    sample: {
      given: '\\dfrac{(3+4)\\times 12}{7}',
      steps: [
        { note: 'First, that within the parentheses', tex: '3 + 4 = 7' },
        { note: 'Then the multiplication', tex: '7 \\times 12 = 84' },
        { note: 'Lastly the division', tex: '84 \\div 7 = 12' },
      ],
      result: '12',
    },
  },
  {
    id: 'algebra',
    numeral: 'II',
    latin: 'De Algebra',
    title: 'Of Algebra',
    blurb:
      'Concerning the simplifying, expanding and factoring of expressions, and the solving of equations for the unknown quantity.',
    initial: 'C',
    actions: ['Simplify', 'Expand', 'Factor', 'Solve'],
    fields: [
      { key: 'expr', label: 'Expression or equation', placeholder: 'x^2 - 5x + 6 = 0' },
      { key: 'var', label: 'Unknown', placeholder: 'x', short: true },
    ],
    sample: {
      given: 'x^2 - 5x + 6 = 0',
      steps: [
        { note: 'The polynomial is resolved into factors', tex: '(x-2)(x-3) = 0' },
        { note: 'Each factor being set equal to nothing', tex: 'x - 2 = 0 \\quad\\text{or}\\quad x - 3 = 0' },
      ],
      result: 'x = 2,\\; x = 3',
    },
  },
  {
    id: 'derivative',
    numeral: 'III',
    latin: 'De Fluxionibus',
    title: 'Of Differentiation',
    blurb:
      'Of the method of fluxions: how the rate of change of a quantity may be found at every point of its course.',
    initial: 'T',
    fields: [
      { key: 'expr', label: 'Function f(x)', placeholder: 'x^2 · sin(x)' },
      { key: 'var', label: 'With respect to', placeholder: 'x', short: true },
      { key: 'order', label: 'Order', placeholder: '1', short: true },
    ],
    sample: {
      given: '\\dfrac{d}{dx}\\left[x^2 \\sin x\\right]',
      steps: [
        { note: 'By the rule of the product', tex: "(uv)' = u'v + uv'" },
        { note: 'Whence', tex: '2x\\sin x + x^2 \\cos x' },
      ],
      result: '2x\\sin x + x^2\\cos x',
    },
  },
  {
    id: 'integral',
    numeral: 'IV',
    latin: 'De Quadraturis',
    title: 'Of Integration',
    blurb:
      'Of quadratures, being the inverse of fluxions: the finding of areas beneath curves and of antiderivatives.',
    initial: 'Q',
    actions: ['Indefinite', 'Definite'],
    fields: [
      { key: 'expr', label: 'Integrand f(x)', placeholder: 'x · e^x' },
      { key: 'var', label: 'Variable', placeholder: 'x', short: true },
      { key: 'lower', label: 'Lower bound', placeholder: '0', short: true, onlyFor: 'Definite' },
      { key: 'upper', label: 'Upper bound', placeholder: '1', short: true, onlyFor: 'Definite' },
    ],
    sample: {
      given: '\\int x\\,e^{x}\\,dx',
      steps: [
        { note: 'By integration in parts, taking u = x, dv = eˣ dx', tex: '\\int u\\,dv = uv - \\int v\\,du' },
        { note: 'Whence', tex: 'x e^{x} - \\int e^{x}\\,dx' },
      ],
      result: '(x - 1)\\,e^{x} + C',
    },
  },
  {
    id: 'limit',
    numeral: 'V',
    latin: 'De Limitibus',
    title: 'Of Limits',
    blurb:
      'Of the value toward which a quantity tendeth as its variable approacheth a given point, from the left or from the right.',
    initial: 'L',
    actions: ['Both sides', 'From left', 'From right'],
    fields: [
      { key: 'expr', label: 'Function f(x)', placeholder: 'sin(x) / x' },
      { key: 'var', label: 'Variable', placeholder: 'x', short: true },
      { key: 'to', label: 'Approaching', placeholder: '0', short: true },
    ],
    sample: {
      given: '\\lim_{x \\to 0} \\dfrac{\\sin x}{x}',
      steps: [
        { note: 'The form being indeterminate', tex: '\\tfrac{0}{0}' },
        { note: "By the rule of l'Hôpital", tex: '\\lim_{x\\to 0} \\dfrac{\\cos x}{1}' },
      ],
      result: '1',
    },
  },
]

// The keys of the reckoning-tablet beneath the input.
export const KEYPAD = [
  ['7', '8', '9', '÷', '(', ')'],
  ['4', '5', '6', '×', '^', '√'],
  ['1', '2', '3', '−', 'π', 'e'],
  ['0', '.', '!', '+', 'x', 'sin'],
  ['cos', 'tan', 'ln', 'log', '∞', '⌫'],
]
