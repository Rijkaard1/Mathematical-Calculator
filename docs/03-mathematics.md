# 3. Which Fields of Mathematics Can Be Computed

The calculator is arranged like a book with five chapters. Each chapter (in Latin, *Liber*,
meaning "book") covers one field of mathematics, going from the basics up to the start of
calculus.

| Chapter | Latin name | Field | In short |
|---|---|---|---|
| I | *De Arithmetica* | Arithmetic | Working with numbers |
| II | *De Algebra* | Algebra | Working with letters and equations |
| III | *De Fluxionibus* | Differentiation | Rates of change (slopes) |
| IV | *De Quadraturis* | Integration | Areas and antiderivatives |
| V | *De Limitibus* | Limits | What a function approaches |

The Latin names are the old names used by mathematicians such as Newton: *fluxions* was
Newton's word for derivatives, and *quadrature* meant finding an area.

---

## Chapter I — Arithmetic

**What it does:** works out the value of any expression made of numbers, one operation at a
time.

| Topic | Examples | Answer |
|---|---|---|
| The four operations | `(3 + 4) × 12 ÷ 7` | 12 |
| Powers and factorials | `2^10 − 5!` | 904 |
| Fractions | `1/3 + 1/4` | 7/12 ≈ 0.583 |
| Roots | `√(16)`, `(−8)^(1/3)` | 4, −2 |
| Logarithms | `ln(e) + log(100)` | 3 |
| Trigonometry, radians | `sin(π/2)` | 1 |
| Trigonometry, degrees | `sin(30)`, `cos(90)`, `tan(45)` | 0.5, 0, 1 |
| Degree sign (any mode) | `sin(30°)` | 0.5 |
| Inverse trigonometry | `asin(1)` · `asin(0.5)` in degrees | 1.570796327 rad · 30° |
| Absolute value | `abs(−7)` | 7 |
| Constants | π, e | 3.14159…, 2.71828… |
| Dividing by zero | `5/0` | ∞ |
| **Imaginary numbers** | `√(−4)`, `(3+2i)×(1−i)`, `i^2`, `e^(i×π)` | 2i, 5 − i, −1, −1 |

**The order of operations** is followed exactly: brackets → powers and roots → × and ÷ →
+ and −. The steps show this order clearly.

---

## Chapter II — Algebra

**What it does:** works with expressions that contain an unknown, like x. There are four
modes.

### Solve
Finds every value of the unknown that makes the equation true.

| Equation | Answer | How it is shown |
|---|---|---|
| `2x + 3 = 7` | x = 2 | Move to one side, factor |
| `x² − 5x + 6 = 0` | x = 3, x = 2 | Factor into (x − 2)(x − 3) |
| `x² = 2` | x = ±√2 | Quadratic formula, Δ = 8 |
| `x³ + x = 0` | x = 0, x = ±i | Factor into x(x² + 1) |
| `x² + 1 = 0` | x = ±i | Δ = −4, so √−4 = 2i |
| `x² + 2x + 5 = 0` | x = −1 ± 2i | Δ = −16, so √−16 = 4i |
| `x³ = 1` | x = 1, x = −½ ± (√3/2)i | Factor, then imaginary roots |
| `sin(x) = 0` | x = nπ (radians) or 180°n (degrees) | n stands for any whole number |
| `sin(x) = 1/2` (degrees) | x = 30° + 360°n, 150° + 360°n | Angles converted, then solved |
| `tan(x) = 1` (degrees) | x = 45° + 180°n | The tangent repeats every 180° |
| `sin(x) = 2` | No real solution | A sine is never more than 1 |

**About imaginary roots:** if the discriminant Δ = b² − 4ac of a quadratic is negative, no
real number works, so the roots are imaginary. They always come in pairs, a + bi and a − bi.

### Simplify
`(x² − 1)/(x − 1)` → **x + 1**  ·  `sin²(x) + cos²(x)` → **1**

### Expand
`(x + 1)³` → **x³ + 3x² + 3x + 1**

### Factor
`x⁴ − 1` → **(x² + 1)(x − 1)(x + 1)**

---

## Chapter III — Differentiation

**What it does:** finds the derivative — the rate at which a function changes. You can
choose the variable and the order (1st up to 10th derivative).

The calculator names the rule it uses:

| Rule | Example | Derivative |
|---|---|---|
| Power rule | x³ | 3x² |
| Sum rule | x³ + 2x | 3x² + 2 |
| Constant multiple | 3 cos(x) | −3 sin(x) |
| Product rule | x² sin(x) | 2x sin(x) + x² cos(x) |
| Quotient rule | (x + 1)/(x − 1) | −2/(x − 1)² |
| Chain rule | sin(x²) | 2x cos(x²) |
| Chain rule | √(1 + x²) | x/√(x² + 1) |
| Exponential rule | e^(3x) | 3e^(3x) |
| Table of derivatives | ln(x) | 1/x |
| Logarithmic differentiation | xˣ | xˣ(ln(x) + 1) |
| Higher order | x³ + 2x, order 3 | 6 |

---

## Chapter IV — Integration

**What it does:** finds antiderivatives and areas under curves. There are two modes.

### Indefinite integrals (antiderivatives)
The answer always ends with **+ C**, and every answer is checked by differentiating it back.

| Integral | Answer | Method named |
|---|---|---|
| ∫ x² + 3x dx | x³/3 + 3x²/2 + C | Sum rule |
| ∫ x eˣ dx | eˣ(x − 1) + C | Integration by parts |
| ∫ x ln(x) dx | x²ln(x)/2 − x²/4 + C | Integration by parts |
| ∫ 1/x dx | ln(x) + C | Reciprocal rule |
| ∫ e^(−x²) dx | (√π/2)·erf(x) + C | Special function |

### Definite integrals (areas)
You give a lower and upper bound. Bounds can be numbers, expressions like π/2, or **∞**.

| Integral | Answer | Method |
|---|---|---|
| ∫₀¹ x² dx | 1/3 | F(1) − F(0) |
| ∫₀^π sin(x) dx | 2 | F(π) − F(0) |
| ∫₁^∞ 1/x² dx | 1 | Limit at infinity |
| ∫₀^∞ e^(−x) dx | 1 | Limit at infinity |
| ∫₀¹ 1/√x dx | 2 | Infinite at one end, still works |
| ∫₀¹ e^(−x²) dx | ≈ 0.7468 | Numerical estimate |

If the function blows up to infinity *inside* the interval (like 1/x² from −1 to 1), the
calculator warns that the integral is improper and may not exist, instead of giving a wrong
number.

---

## Chapter V — Limits

**What it does:** finds the value a function gets closer and closer to as x approaches a
point. Three modes: **both sides**, **from the left** (x → a⁻), **from the right**
(x → a⁺). The point can be a number or ±∞.

| Limit | Answer | What is shown |
|---|---|---|
| sin(x)/x, x → 0 | 1 | 0/0 form, l'Hôpital's rule |
| (x² − 4)/(x − 2), x → 2 | 4 | 0/0 form, l'Hôpital's rule |
| x², x → 3 | 9 | Direct substitution |
| 1/x², x → 0 | ∞ | Both sides go to ∞ |
| (1 + 1/x)ˣ, x → ∞ | e | Limit at infinity |
| 1/x, x → 0 | Does not exist | Left gives −∞, right gives +∞ |
| \|x\|/x, x → 0 | Does not exist | Left gives −1, right gives 1 |
| \|x\|/x, x → 0⁻ | −1 | One-sided limit |
| sin(1/x), x → 0 | Does not exist | Keeps oscillating |
| x sin(1/x), x → 0 | ≈ 0 | Found numerically |

---

## What the calculator does *not* do (yet)

To be honest about its limits:

- **Degrees only in Arithmetic and Algebra.** Differentiation, Integration and Limits always
  use radians, because the calculus rules only hold in radians. There is no gradians mode.
- **Imaginary numbers** work in Arithmetic and Algebra, but Differentiation, Integration and
  Limits work with real numbers only.
- **One variable at a time** — no systems of equations (like solving for x and y together),
  no partial derivatives, no double integrals.
- **Steps explain the main rule only.** For example, a long chain-rule problem shows the
  outer rule and the inner derivative, but not every tiny sub-step.
- **No matrices, statistics, graphs or differential equations.**
- Integrals with no formula are given as a **decimal estimate**, not an exact value.
