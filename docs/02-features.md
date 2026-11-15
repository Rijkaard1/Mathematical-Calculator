# 2. Features

This document lists everything the calculator can do for you, and how to use it.

---

## 2.1 Quick tour

When you open the site you see:

1. **The title page** — the name of the "book".
2. **The Contents** — five chapter buttons, one for each kind of maths.
3. **The open book** —
   - the **left page** is where you write your problem,
   - the **right page** is where the answer and its working appear.

Each chapter opens with a **worked example** already filled in and solved, so you can see
straight away what kind of problems it handles.

---

## 2.2 Step-by-step working

The calculator does not just give an answer — it shows **how** it got there, like a teacher
writing on the board. Every answer page has three parts:

| Part | What it shows |
|---|---|
| **Proposition. Given** | Your problem, written as a proper formula. |
| **Demonstration** | The numbered steps (I, II, III …), each with a short explanation. |
| **Therefore** | The final answer in a framed box, followed by *"Which was to be found ∎"*. |

Examples of the explanations you will see:

- *"Performing the multiplication 7 × 12 = 84"*
- *"By the rule of the product (uv)′ = u′v + uv′"*
- *"The discriminant being negative, no real number satisfieth the equation"*
- *"Proof: differentiating F returneth the integrand"*

(The wording is written in an old-fashioned style to match the old-book theme.)

---

## 2.3 Exact answers *and* decimals

Where possible, answers are given **exactly**, with a decimal approximation next to them:

| Problem | Answer shown |
|---|---|
| 1/3 + 1/4 | 7/12 ≈ 0.5833333333 |
| x² = 2 | x = √2 ≈ 1.414213562 |
| ∫₀¹ x² dx | 1/3 ≈ 0.3333333333 |
| lim x→∞ (1 + 1/x)ˣ | e ≈ 2.718281828 |

---

## 2.4 Imaginary numbers

When a problem has no answer among the ordinary (real) numbers, the calculator moves into
the **imaginary numbers**, where **i = √−1** and **i² = −1**.

- In **Arithmetic**: √(−4) = 2i, (3 + 2i) × (1 − i) = 5 − i, e^(iπ) = −1.
- In **Algebra**: x² + 1 = 0 gives **x = ±i**, and x² + 2x + 5 = 0 gives **x = −1 ± 2i**.

A step always explains *why* the answer became imaginary. Imaginary roots are shown in the
form **a ± bi**, with each root paired with its "mirror" partner (its conjugate).

---

## 2.5 The reckoning tablet (keypad)

Under the input boxes is a keypad of 36 keys, styled like carved tablets:

| Row | Keys |
|---|---|
| 1 | 7 8 9 ÷ ( ) |
| 2 | 4 5 6 × xⁿ √ |
| 3 | 1 2 3 − π e |
| 4 | 0 . ! + x i |
| 5 | sin cos tan ln log abs |
| 6 | = ∞ asin acos atan ⌫ |

Useful details:

- Keys type into **whichever box you clicked last**, at the cursor position — so you can
  press **∞** straight into the "Upper bound" box.
- Function keys (sin, √, ln, abs …) add the opening bracket for you: pressing **sin** types
  `sin(`.
- **⌫** deletes one character (or the selected text).
- You can also just type on your normal keyboard. Both `2x` and `2*x` work, and `^` means
  "to the power of".

---

## 2.6 Other conveniences

| Feature | How it helps |
|---|---|
| **Press Enter** to calculate | No need to click the seal every time. |
| **"Erase the slate"** | Clears all the boxes at once. |
| **Mode buttons** | Some chapters have options, e.g. Algebra: *Solve / Simplify / Expand / Factor*. Switching mode recalculates immediately. |
| **Examples per mode** | In Algebra, each mode has its own example, so switching modes always shows something useful. |
| **Hints** | Each chapter shows a short hint under the keypad (e.g. "Bounds may be numbers, π/2, or ∞"). |
| **Friendly errors** | If something goes wrong, an **"Erratum"** page explains it in plain words and shows an example of correct input. |
| **Works on phones** | On narrow screens the two pages stack on top of each other. Long formulas scroll sideways inside their line instead of breaking the page. |
| **Accessible** | Keys and buttons have readable labels for screen readers, and every button can be reached with the keyboard. |
| **Private** | All maths happens in your own browser — nothing you type is sent anywhere. |

---

## 2.7 Error messages

Some examples of what the calculator tells you when it cannot help:

| You type | It says |
|---|---|
| `x + 1` in Arithmetic | Arithmetick admitteth no unknown quantities ("x"). Turn to Liber II, De Algebra. |
| `2*(3+` | The expression could not be read: Unexpected end of expression. |
| A definite integral without bounds | Both bounds of the definite integral must be given. |
| ∫₋₁¹ 1/x² dx | The integrand is unbounded or undefined upon the interval; the integral is improper and may diverge. |
| `x^2 = 4` in Simplify mode | An equation is to be solved, not simplified — choose "Solve", or remove the sign "=". |

---

## 2.8 Input cheat-sheet

| To write… | Type… |
|---|---|
| x squared | `x^2` |
| square root of x | `sqrt(x)` or `√(x)` |
| natural log | `ln(x)` |
| log base 10 | `log(x)` |
| e to the x | `e^x` or `exp(x)` |
| absolute value | `abs(x)` |
| pi | `pi` or `π` |
| infinity | `∞`, `inf` or `Infinity` |
| imaginary unit | `i` |
| 5 factorial | `5!` |
| an equation | `x^2 - 5x + 6 = 0` |

Angles in trigonometry are always in **radians** (so sin(π/2) = 1).
