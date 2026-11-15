# 4. Design

This document explains how the calculator looks, and why.

---

## 4.1 The idea: an old mathematics book

Most calculators look modern — flat buttons, bright colours, a digital screen.
Mathematical Calculator goes the other way. It is designed to look like **a printed
mathematics book from the age before the modern world**, the kind of treatise that Newton,
Euler or Euclid's translators might have written.

The whole site is one idea carried through every detail:

- The site is a **book** with a title page and a table of contents.
- Each kind of maths is a **chapter** with a Latin name.
- You write your problem on the **left page** of an open book.
- The answer is written on the **right page** as a **proof**, the way old geometry books
  wrote them.
- The "Calculate" button is a **red wax seal**.
- The book rests on a **dark wooden desk**.

---

## 4.2 Page layout

```
┌──────────────────────────────────────────────────────────┐
│                     TITLE PAGE                           │
│   A Treatise upon the Art of Reckoning                   │
│            MATHEMATICAL CALCULATOR                       │
│   Printed for the Curious Reader · Anno MMXXVI           │
├──────────────────────────────────────────────────────────┤
│                    THE CONTENTS                          │
│  [Liber I] [Liber II] [Liber III] [Liber IV] [Liber V]   │
├────────────────────────────┬─┬───────────────────────────┤
│  LEFT PAGE (input)         │ │  RIGHT PAGE (answer)      │
│  Chapter title             │s│  Proposition. Given       │
│  Decorated first letter    │p│  Demonstration I, II, III │
│  Mode buttons              │i│  Therefore  [ answer ]    │
│  Input lines               │n│  Which was to be found ∎  │
│  Reckoning tablet (keypad) │e│                           │
│  Erase the slate  (SEAL)   │ │                           │
├────────────────────────────┴─┴───────────────────────────┤
│                 Finis. (colophon)                        │
└──────────────────────────────────────────────────────────┘
```

| Part | Old-book idea behind it |
|---|---|
| **Title page** | Old books began with a decorated title page with a double ruled border, a subtitle that describes the contents, and the year in Roman numerals (*Anno MMXXVI* = 2026). |
| **The Contents** | Chapters are called *Liber I – V* ("Book I – V") with Latin names. |
| **Running heads** | The top of each page shows small capitals, e.g. *LIBER IV · DE QUADRATURIS*, like printed books. |
| **Drop cap** | Each chapter's description starts with a large decorated first letter in a gold frame. |
| **Spine** | A dark leather strip between the two pages makes them look like an open book. |
| **Folio** | Page numbers at the bottom in small Roman numerals (*— iv —*, *— iv · verso —*; *verso* means the back of a page). |
| **Colophon** | The book ends with *"Finis."* and a note about the typefaces, as old printers did. |

---

## 4.3 Colours

The colours come from paper, ink and wood. They are stored as CSS variables in
`src/index.css`, so they can be changed in one place.

| Name | Colour | Used for |
|---|---|---|
| Ink | `#2b1d10` dark brown-black | Main text |
| Soft ink | `#5b4630` | Labels, lines |
| Faint ink | `#8a7457` | Hints, page numbers |
| Rubric red | `#8b1e1e` | Headings and highlights |
| Deep red | `#5e1010` | Wax seal shadow, error text |
| Gilt | `#a8812f` gold | Drop-cap frame |
| Parchment | `#ecdcb7` | Page colour |
| Light parchment | `#f4e8cc` | Centre of each page |
| Parchment edge | `#c9a874` | Darker, aged page edges |
| Desk | `#2a1a0f` dark wood | Background |

**Why red headings?** In medieval and early printed books, headings were written in red ink,
called *rubrics* (from the Latin for "red"). The calculator follows the same custom.

---

## 4.4 Typefaces (fonts)

| Typeface | Style | Used for |
|---|---|---|
| **IM Fell English** | A digital copy of type cut in the 1600s–1700s for Bishop John Fell at Oxford. Slightly rough, like real old printing. | Body text, inputs, explanations |
| **IM Fell English SC** | The same, in small capitals | Labels, running heads, "Liber" numbers |
| **Cinzel Decorative** | Inspired by Roman stone inscriptions | The big title, chapter titles, drop caps, the seal |
| **UnifrakturMaguntia** | Blackletter (Gothic) script | "The Contents" heading |
| **KaTeX fonts** | Classic mathematics type | All formulas |

The Fell typeface also has **old-style numbers**, where some digits drop below the line
(like 3, 4, 5, 7, 9). This is exactly how numbers looked in old books.

---

## 4.5 Textures and small details

Everything is drawn with code — the site uses **no image files** except the small tab icon.

- **Parchment grain:** a fine random noise pattern laid over the page colour.
- **Age stains:** a second, larger noise pattern makes soft brownish blotches.
- **Darker edges:** each page is lighter in the centre and darker at the edges, like old
  paper.
- **Page curve:** a shadow near the spine makes the pages look like they bend into the book.
- **Wooden desk:** thin vertical stripes with a warm glow at the top, like candlelight.
- **Margin drawing:** a faint Euclid-style geometry figure (a circle, a right triangle and
  points labelled A, B, C) sits in the corner of the answer page.
- **Fleurons:** small decorative ornaments (a curl with red dots) separate sections.
- **Favicon:** a drawing compass on parchment, a classic tool of geometry.

---

## 4.6 The controls

### The reckoning tablet (keypad)
The keys look like small blocks of pale wood or stone. They have a darker bottom edge, so
they look raised, and they **press down** slightly when clicked. The power key shows **xⁿ**
instead of `^`, because the `^` symbol looks odd in the old typeface.

### The input lines
Instead of boxes, inputs are **ruled lines**, like lines on a page to write on. The line
turns red when you are writing on it. Placeholders are shown in faint italic.

### The mode buttons
Small rounded tabs in italic. The active one is filled with red ink.

### The wax seal
The calculate button is a **red wax seal** with an uneven, melted edge and a ring stamped
with **Q.E.F.** — short for *quod erat faciendum*, Latin for "which was to be done", a phrase
mathematicians used to end a construction. When you hover over it the seal tilts slightly,
and when you press it, it shrinks a little as if being stamped.

---

## 4.7 The answer page as a proof

Old geometry books, starting with Euclid, wrote every result in a fixed pattern. The answer
page copies it:

1. **Proposition. Given** — what we start with.
2. **Demonstration** — numbered steps in Roman numerals (I, II, III…), with red numbers.
3. **Therefore** — the result, inside a double-ruled frame.
4. ***Which was to be found.* ∎** — the closing line, ending with a red square, the
   traditional "end of proof" mark.

When something goes wrong, the page is headed **Erratum** — the word old books used for a
printing mistake.

The explanations are written in a light old-fashioned English (*"the discriminant being
negative, no real number satisfieth the equation"*), to match the period, while staying
easy to understand.

---

## 4.8 Phones and small screens

The design adapts to the screen size:

| Screen | Layout |
|---|---|
| **Wide (over 860 px)** | The two pages sit side by side like an open book. |
| **Narrow (phones, tablets upright)** | The pages stack: input on top, answer below, joined by a thin spine. Chapter buttons wrap onto more lines. |
| **Very narrow (under 420 px)** | Text and keys become slightly smaller to fit. |

Long formulas never stretch the page — instead they **scroll sideways within their own
line**. The site was tested at 375 px wide (a typical phone) with no sideways scrolling of
the page.

---

## 4.9 Motion and accessibility

- Opening a chapter gently **fades the book in**. People who turn on "reduce motion" in
  their system settings do not see this animation.
- Every button can be reached and used with the **keyboard**, and the focused button shows a
  red dashed outline.
- Keys that are only symbols have spoken labels for screen readers, such as
  "Erase one character", "Power" and "Imaginary unit i".
- The answer page is marked as a **live region**, so screen readers announce new answers.
