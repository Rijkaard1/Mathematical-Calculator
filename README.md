# Mathematical Calculator

*A Treatise upon the Art of Reckoning* — a web calculator styled after an old printed
mathematics book, covering everything from basic arithmetic to introductory calculus.

## Chapters

| Liber | Chapter | What it computes |
|---|---|---|
| I · *De Arithmetica* | Arithmetic | `+ − × ÷`, powers, roots, factorial, constants |
| II · *De Algebra* | Algebra | simplify, expand, factor, solve equations |
| III · *De Fluxionibus* | Differentiation | derivatives of any order |
| IV · *De Quadraturis* | Integration | indefinite and definite integrals |
| V · *De Limitibus* | Limits | two-sided and one-sided limits |

## Status

- [x] Stage 1 — design (ancient-manuscript theme, layout, responsive)
- [x] Stage 2 — computation engine (math.js + nerdamer) with step-by-step working
- [ ] Stage 3 — deploy to GitHub Pages

## Running locally

```bash
npm install
npm run dev
```

Built with React + Vite, KaTeX for typesetting, and the IM Fell, Cinzel Decorative and
UnifrakturMaguntia typefaces from Google Fonts.

## How the engine works

- **Arithmetic** — parsed with math.js and reduced one operation at a time, following the order of operations, so every step is shown.
- **Algebra** — nerdamer simplifies, expands, factors and solves (including irrational and imaginary roots).
- **Differentiation** — names the governing rule (sum, product, quotient, chain, power, exponential, logarithmic) before giving the reduced result; any order from 1 to 10.
- **Integration** — every antiderivative is checked by differentiating it back. Definite integrals use the fundamental theorem, cross-checked against Simpson's rule, and fall back to numerical quadrature when no closed form exists. Infinite bounds are supported.
- **Limits** — one-sided limits are computed separately and compared, so jump discontinuities such as |x|/x at 0 are reported correctly as non-existent; 0/0 forms show the l'Hôpital step.

Run `node scripts/engine-check.mjs` to print the engine's working for a battery of test cases.
