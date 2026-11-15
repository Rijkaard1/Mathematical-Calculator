# 1. How the Calculator Was Built

This document explains how Mathematical Calculator was made: the tools it uses, how the
code is organised, and how a calculation travels from the moment you type it to the moment
the answer appears on the page.

---

## 1.1 The big picture

Mathematical Calculator is a **website**. It runs completely inside your web browser.
There is no server doing the maths in the background: when you press the red wax seal, your
own browser does all the work. This makes it fast, free to host, and able to work without
sending your input anywhere.

The project was built in three stages:

| Stage | What was done |
|---|---|
| **Stage 1 — Design** | The look of the site: an old mathematics book with parchment pages, old typefaces and a wax-seal button. At this stage the answers were only examples. |
| **Stage 2 — Engine** | The "brain" of the calculator, which really works out the answers and writes the steps. |
| **Stage 3 — Publishing** | Putting the site on the internet with GitHub Pages, so anyone can open it with a link. |

Later, **imaginary numbers** were added, so problems with no real answer (like x² + 1 = 0)
can still be solved. After that came a **degrees / radians switch** for trigonometry.

---

## 1.2 The tools used

| Tool | What it is | Why it is used |
|---|---|---|
| **React** | A popular library for building web pages out of small pieces called *components*. | Each part of the page (title page, contents, input page, answer page) is its own component, which keeps the code tidy. |
| **Vite** | A build tool for web projects. | Starts a fast local test server while developing, and packs everything into small files for publishing. |
| **math.js** | A maths library for JavaScript. | Reads (parses) what you type and works out numbers, including imaginary numbers. Used for Arithmetic and for quick number checks. |
| **nerdamer** | A *computer algebra system* — a library that can work with letters like x, not only numbers. | Does the symbolic work: solving equations, factoring, derivatives, integrals and limits. |
| **KaTeX** | A library that draws mathematical formulas. | Turns answers into proper maths writing, with real fractions, square-root signs and integral signs. |
| **Google Fonts** | Free web typefaces. | Supplies the old-book typefaces (see the Design document). |
| **GitHub + GitHub Pages** | Code storage and free website hosting. | Keeps the code safe and publishes the site. |
| **GitHub Actions** | Automatic tasks that run on GitHub. | Every time new code is pushed, it rebuilds and republishes the site automatically. |

---

## 1.3 How the code is organised

```
Mathematical-Calculator/
├── index.html              ← the single web page; loads the fonts and the app
├── public/favicon.svg      ← the small icon in the browser tab (a drawing compass)
├── src/
│   ├── main.jsx            ← starting point: puts the app on the page
│   ├── App.jsx             ← all the visible parts of the book
│   ├── App.css             ← the look of the book (pages, keypad, seal…)
│   ├── index.css           ← colours, fonts and the wooden-desk background
│   ├── chapters.js         ← the list of chapters, their fields, examples and keypad keys
│   └── engine/             ← the "brain" that does the maths
│       ├── index.js        ← one entry point: compute(chapter, values, mode)
│       ├── common.js       ← shared helpers (cleaning input, formatting answers)
│       ├── arithmetic.js   ← Chapter I
│       ├── algebra.js      ← Chapter II
│       ├── derivative.js   ← Chapter III
│       ├── integral.js     ← Chapter IV
│       └── limit.js        ← Chapter V
├── scripts/engine-check.mjs ← a test script that runs many example problems
└── .github/workflows/deploy.yml ← automatic publishing to GitHub Pages
```

A key idea is that the **look** and the **maths** are kept apart. The files `App.jsx` and
`App.css` only care about showing things. The `engine/` folder only cares about getting
the right answer. They talk to each other through one simple function:

```js
compute('algebra', { expr: 'x^2 + 1 = 0', var: 'x' }, 'Solve')
```

This returns either an answer…

```js
{
  given:  'x^{2}+1 = 0',            // the problem, as a formula
  steps:  [ { note: '...', tex: '...' }, ... ],   // the working
  result: 'x = \\pm i'               // the final answer
}
```

…or an error message written in plain words, such as
*"Both bounds of the definite integral must be given."*

---

## 1.4 The journey of one calculation

Here is what happens when you type `x^2 · sin(x)` in the Differentiation chapter and press
the seal:

1. **Reading the input.** The page collects what you typed in each box.
2. **Cleaning the input.** `common.js` turns friendly symbols into ones the maths libraries
   understand:
   - `×` → `*`, `÷` → `/`, `−` → `-`
   - `π` → `pi`, `∞` → `Infinity`, `√` → `sqrt`
   - `ln(` → natural logarithm, `log(` → logarithm with base 10
3. **Understanding the structure.** math.js breaks the expression into a *tree*. For
   `x^2 · sin(x)` the top of the tree is a multiplication with two branches, `x^2` and
   `sin(x)`.
4. **Choosing the rule.** Because the top is a multiplication of two parts that both contain
   x, the engine knows the **product rule** is needed and writes that as a step.
5. **Doing the maths.** nerdamer works out the derivative of each part and of the whole.
6. **Checking.** Where possible, the engine checks its own answer (more on this below).
7. **Writing the answer.** Every step and the result are turned into LaTeX (a common way of
   writing formulas) and KaTeX draws them on the right-hand page.

---

## 1.5 How each chapter's engine works

### Arithmetic — one operation at a time
The expression is turned into a tree. The engine then repeatedly finds the **deepest
operation whose inputs are all plain numbers**, works it out, and puts the result back into
the tree. Each time, it writes a step. Because it always starts from the deepest part, the
steps automatically follow the correct order of operations (brackets first, then powers,
then × and ÷, then + and −).

Example — `(3 + 4) × 12 ÷ 7`:

```
Performing the addition        3 + 4 = 7      →  7 × 12 ÷ 7
Performing the multiplication  7 × 12 = 84    →  84 ÷ 7
Performing the division        84 ÷ 7 = 12    →  12
```

If the answer is a decimal that is really a simple fraction, the fraction is shown too
(1/3 + 1/4 = 7/12 ≈ 0.5833).

### Algebra — with a teacher's explanation
nerdamer does the simplifying, expanding, factoring and solving. Around that, the engine
adds explanation steps: moving everything to one side of the equation, showing the factored
form, or — for a quadratic that does not factor — showing the **quadratic formula** and the
**discriminant** (Δ = b² − 4ac).

### Differentiation — naming the rule
The engine looks at the outer shape of the function and names the rule that applies: the sum
rule, constant-multiple rule, product rule, quotient rule, power rule, chain rule,
exponential rule, or logarithmic differentiation (for things like xˣ). It shows the parts,
their derivatives, and then the tidied answer. Higher orders (2nd, 3rd … 10th derivative)
are found by differentiating again and again.

### Integration — and proving the answer
After nerdamer finds an antiderivative F(x), the engine **differentiates F(x) back** and
checks, at several test points, that it really gives the original function. If not, the
answer is not trusted.

For definite integrals, the answer F(b) − F(a) is also compared with a **numerical
estimate** (Simpson's rule, which adds up the area in 2000 thin strips). If there is no
formula for the antiderivative (for example e^(−x²)), the numerical estimate itself is
given.

### Limits — checking both sides
The engine works out the limit **from the left** and **from the right** separately, and only
says the limit exists if both sides agree. This was important: during testing, the maths
library gave the wrong two-sided answer for |x|/x at 0, and checking each side separately
fixed it. If a formula cannot be found, the engine approaches the point step by step with
numbers (x = 0.01, 0.001, 0.0001 …) and watches where the values settle.

---

## 1.5a How degrees mode works

- **Arithmetic:** math.js lets you hand it your own versions of functions in a *scope*. In
  degrees mode the engine passes degree versions of sin, cos, tan (and sec, csc, cot) that
  first multiply the angle by π/180. It also passes asin, acos and atan versions that turn
  the answer back into degrees. At whole quarter turns (0°, 90°, 180°, 270°) the exact
  values are used, so cos 90° is exactly 0. tan 90° stops with a clear message.
- **Algebra (solving):** in degrees mode, every angle in the equation is rewritten before
  solving: sin(u) becomes sin(π/180 · u), and asin(u) becomes (180/π) · asin(u). Then
  nerdamer solves it as usual, and the answers come out in degrees. Answers that repeat are
  tidied into the form a + b·n (e.g. 30 + 360n). Answers that aren't real numbers, like
  arcsin(2), are thrown away.
- **The ° sign** is turned into `*(pi/180)` in radians mode, and simply removed in degrees
  mode.
- The chosen mode is saved in the browser (localStorage), so it is remembered next time.

## 1.6 How the calculator checks itself

Maths libraries are clever but not perfect, so the calculator double-checks where it can:

| Check | Where |
|---|---|
| Differentiate the antiderivative back and compare | Integration |
| Compare the exact definite integral with a numerical one | Integration |
| Calculate left and right limits separately and compare | Limits |
| Compare the formula answer with a numerical approach | Limits |
| Reject inputs it cannot read, with a clear message | Every chapter |

---

## 1.7 Testing

The file `scripts/engine-check.mjs` contains **64 example problems** covering all five
chapters — including tricky ones like 5 ÷ 0, sin(1/x) near 0, the integral of 1/√x from 0 to 1,
and x⁴ + 1 = 0. Running it prints the full working for each one, so any mistake is easy to
spot:

```bash
node scripts/engine-check.mjs
```

The site was also tested in a real browser at desktop and phone sizes, by typing problems
and using the keypad.

Some bugs found and fixed during testing:

- The two-sided limit of |x|/x at 0 came out as 0 (it should not exist).
- `ln` was not understood by the maths library, so it is now translated first.
- The integral of 1/√x from 0 to 1 gave 9.4 instead of 2. The method now avoids touching the
  "infinite" end point.
- Some answers showed giant fractions like 10533759911871435867/25000000000000000000; these
  are now shown as decimals.
- `2x + 3 = 7` was wrongly reported as having no x in it.

---

## 1.8 Running and publishing

**To run it on your own computer** (you need Node.js installed):

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` in a browser.

**To publish a new version**, simply push the code to the `main` branch on GitHub. GitHub
Actions then:

1. installs everything,
2. builds the site (`npm run build`),
3. uploads it to GitHub Pages.

About a minute later the live site is updated at
**https://rijkaard1.github.io/Mathematical-Calculator/**.
