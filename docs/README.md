# Mathematical Calculator — Documentation

*A Treatise upon the Art of Reckoning*

Mathematical Calculator is a free website that solves maths problems from basic arithmetic
up to the beginning of calculus. It shows the full working for every answer. It is designed
to look like a mathematics book from centuries ago.

**Try it:** https://rijkaard1.github.io/Mathematical-Calculator/
**Code:** https://github.com/Rijkaard1/Mathematical-Calculator

---

## Contents

| # | Document | What you will find |
|---|---|---|
| 1 | [How the Calculator Was Built](01-how-it-was-built.md) | The tools, how the code is organised, how a calculation works step by step, testing and publishing. |
| 2 | [Features](02-features.md) | Everything the calculator can do, the keypad, error messages and an input cheat-sheet. |
| 3 | [Which Fields of Mathematics Can Be Computed](03-mathematics.md) | All five chapters with worked examples, plus what the calculator cannot do yet. |
| 4 | [Design](04-design.md) | The old-book theme: layout, colours, typefaces, textures, controls and mobile support. |

---

## The project in one minute

- **Five chapters:** Arithmetic · Algebra · Differentiation · Integration · Limits.
- **Shows its working:** every answer comes with numbered steps and the rule used.
- **Degrees or radians:** a switch for trigonometry in Arithmetic and Algebra
  (sin 30° = 0.5, sin(x) = ½ → x = 30° + 360°n), remembered between visits.
- **Imaginary numbers:** when there is no real answer, it finds the imaginary one
  (x² + 1 = 0 → x = ±i).
- **Checks itself:** integrals are checked by differentiating back, and limits are checked
  from both sides.
- **Old-book design:** parchment pages, Latin chapter names, red headings, and a wax seal
  as the button.
- **Runs in your browser:** fast, private, and it works on phones.
- **Built with:** React, Vite, math.js, nerdamer and KaTeX. It is published with GitHub Pages.
