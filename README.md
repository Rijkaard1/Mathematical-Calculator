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
- [ ] Stage 2 — computation engine (math.js + nerdamer) with step-by-step working
- [ ] Stage 3 — deploy to GitHub Pages

## Running locally

```bash
npm install
npm run dev
```

Built with React + Vite, KaTeX for typesetting, and the IM Fell, Cinzel Decorative and
UnifrakturMaguntia typefaces from Google Fonts.
