import { useMemo, useRef, useState } from 'react'
import katex from 'katex'
import { CHAPTERS, KEYPAD } from './chapters.js'
import { compute } from './engine/index.js'
import './App.css'

function Tex({ expr, display = false }) {
  const html = useMemo(
    () => katex.renderToString(expr, { displayMode: display, throwOnError: false }),
    [expr, display],
  )
  return <span className="tex" dangerouslySetInnerHTML={{ __html: html }} />
}

function Fleuron() {
  return (
    <svg className="fleuron" viewBox="0 0 240 24" aria-hidden="true">
      <path d="M0 12 H96" />
      <path d="M144 12 H240" />
      <path d="M104 12 C110 2, 118 2, 120 12 C122 2, 130 2, 136 12 C130 22, 122 22, 120 12 C118 22, 110 22, 104 12 Z" />
      <circle cx="98" cy="12" r="2" />
      <circle cx="142" cy="12" r="2" />
    </svg>
  )
}

// A small Euclidean figure drawn in the margin of the result page.
function MarginFigure() {
  return (
    <svg className="margin-figure" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="44" />
      <path d="M16 60 H104 M60 16 V104" className="faint" />
      <path d="M60 60 L91 29" />
      <path d="M60 60 L91 60 L91 29" className="faint" />
      <path d="M72 60 A12 12 0 0 0 68.5 51.5" />
      <text x="94" y="26">A</text>
      <text x="94" y="72">B</text>
      <text x="48" y="74">C</text>
    </svg>
  )
}

function TitlePage() {
  return (
    <header className="title-page">
      <p className="title-kicker">A Treatise upon the Art of Reckoning</p>
      <h1>
        <span className="title-main">Mathematical</span>
        <span className="title-main">Calculator</span>
      </h1>
      <Fleuron />
      <p className="title-sub">
        Containing the Rules of <em>Arithmetick</em>, <em>Algebra</em>, and the
        Doctrine of <em>Fluxions, Quadratures</em> &amp; <em>Limits</em>
      </p>
      <p className="title-imprint">Printed for the Curious Reader · Anno MMXXVI</p>
    </header>
  )
}

function Contents({ active, onSelect }) {
  return (
    <nav className="contents" aria-label="Chapters">
      <h2 className="contents-heading">The Contents</h2>
      <ol>
        {CHAPTERS.map((c) => (
          <li key={c.id}>
            <button
              className={c.id === active ? 'chapter-tab active' : 'chapter-tab'}
              onClick={() => onSelect(c.id)}
              aria-current={c.id === active ? 'page' : undefined}
            >
              <span className="tab-numeral">Liber {c.numeral}</span>
              <span className="tab-latin">{c.latin}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}

const FUNCTION_KEYS = ['sin', 'cos', 'tan', 'ln', 'log', '√', 'abs', 'asin', 'acos', 'atan']

function InputPage({ chapter, values, setValues, mode, setMode, onCompute }) {
  const inputs = useRef({})
  const [focused, setFocused] = useState('expr')

  const visibleFields = chapter.fields.filter((f) => !f.onlyFor || f.onlyFor === mode)

  // Keys write into whichever line of the slate was last touched, at the caret.
  const press = (key) => {
    const target = visibleFields.some((f) => f.key === focused) ? focused : 'expr'
    const el = inputs.current[target]
    const cur = values[target] ?? ''
    const start = el?.selectionStart ?? cur.length
    const end = el?.selectionEnd ?? cur.length
    let next
    let caret
    if (key === '⌫') {
      const from = start === end ? Math.max(0, start - 1) : start
      next = cur.slice(0, from) + cur.slice(end)
      caret = from
    } else {
      const text = FUNCTION_KEYS.includes(key) ? `${key}(` : key
      next = cur.slice(0, start) + text + cur.slice(end)
      caret = start + text.length
    }
    setValues({ ...values, [target]: next })
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(caret, caret)
    })
  }

  return (
    <section className="page page-left">
      <div className="page-head">
        <span>Liber {chapter.numeral}</span>
        <span>{chapter.latin}</span>
      </div>

      <h2 className="chapter-title">
        <span className="chapter-numeral">Chapter {chapter.numeral}.</span>
        {chapter.title}
      </h2>

      <p className="chapter-blurb">
        <span className="drop-cap">{chapter.blurb[0]}</span>
        {chapter.blurb.slice(1)}
      </p>

      {chapter.actions && (
        <div className="modes" role="tablist" aria-label="Operation">
          {chapter.actions.map((a) => (
            <button
              key={a}
              role="tab"
              aria-selected={mode === a}
              className={mode === a ? 'mode active' : 'mode'}
              onClick={() => setMode(a)}
            >
              {a}
            </button>
          ))}
        </div>
      )}

      <form
        className="inscription"
        onSubmit={(e) => {
          e.preventDefault()
          onCompute()
        }}
      >
        <div className="fields">
          {visibleFields.map((f) => (
            <label key={f.key} className={f.short ? 'field short' : 'field'}>
              <span className="field-label">{f.label}</span>
              <input
                ref={(el) => (inputs.current[f.key] = el)}
                value={values[f.key] ?? ''}
                placeholder={f.placeholder}
                onFocus={() => setFocused(f.key)}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                spellCheck="false"
                autoComplete="off"
                autoCapitalize="off"
              />
            </label>
          ))}
        </div>

        <div className="tablet" aria-label="Reckoning tablet">
          {KEYPAD.flat().map((k) => (
            <button
              type="button"
              key={k}
              className="key"
              onMouseDown={(e) => e.preventDefault() /* keep the caret in the field */}
              onClick={() => press(k)}
              aria-label={
                k === '⌫' ? 'Erase one character' : k === '^' ? 'Power' : k === 'i' ? 'Imaginary unit i' : undefined
              }
            >
              {k === '^' ? 'xⁿ' : k}
            </button>
          ))}
        </div>

        <p className="hint">{chapter.hint}</p>

        <div className="seal-row">
          <button type="button" className="clear-link" onClick={() => setValues({})}>
            Erase the slate
          </button>
          <button type="submit" className="seal" aria-label="Compute" title="Compute (Enter)">
            <span>Q.E.F.</span>
          </button>
        </div>
      </form>

      <div className="folio">— {chapter.numeral.toLowerCase()} —</div>
    </section>
  )
}

function ResultPage({ chapter, outcome }) {
  return (
    <section className="page page-right" aria-live="polite">
      <div className="page-head">
        <span>The Demonstration</span>
        <span>Propositio</span>
      </div>

      <MarginFigure />

      {!outcome ? (
        <div className="awaiting">
          <p className="awaiting-text">
            Inscribe thy quantity upon the facing leaf, and press the seal, that the
            demonstration may here be written.
          </p>
          <Fleuron />
        </div>
      ) : outcome.error ? (
        <article className="demonstration erratum">
          <h3 className="prop-heading">Erratum</h3>
          <p className="erratum-text">{outcome.error}</p>
          <p className="erratum-hint">
            Example: <code>{chapter.example.expr}</code>
          </p>
        </article>
      ) : (
        <article className="demonstration">
          <h3 className="prop-heading">Proposition. Given</h3>
          <div className="given">
            <Tex expr={outcome.given} display />
          </div>

          {outcome.steps.length > 0 && (
            <>
              <h3 className="prop-heading">Demonstration</h3>
              <ol className="steps">
                {outcome.steps.map((st, i) => (
                  <li key={i}>
                    <span className="step-note">
                      {st.note}
                      {st.sub ? (
                        <>
                          {' '}
                          <span className="nowrap">
                            <Tex expr={st.sub} />
                            {st.tex ? ',' : '.'}
                          </span>
                        </>
                      ) : st.tex ? (
                        ','
                      ) : (
                        '.'
                      )}
                    </span>
                    {st.tex && <Tex expr={st.tex} display />}
                  </li>
                ))}
              </ol>
            </>
          )}

          <h3 className="prop-heading">Therefore</h3>
          <div className="result-box">
            <Tex expr={outcome.result} display />
          </div>
          <p className="qed">Which was to be found.</p>
        </article>
      )}

      <div className="folio">— {chapter.numeral.toLowerCase()} · verso —</div>
    </section>
  )
}

const firstMode = (c) => c.actions?.[0]

export default function App() {
  const [active, setActive] = useState(CHAPTERS[0].id)
  const chapter = CHAPTERS.find((c) => c.id === active)
  const [values, setValues] = useState(chapter.example)
  const [mode, setModeState] = useState(firstMode(chapter))
  const [outcome, setOutcome] = useState(() => compute(chapter.id, chapter.example, firstMode(chapter)))

  const select = (id) => {
    const c = CHAPTERS.find((x) => x.id === id)
    setActive(id)
    setValues(c.example)
    setModeState(firstMode(c))
    setOutcome(compute(c.id, c.example, firstMode(c)))
  }

  const setMode = (m) => {
    // If the slate still holds another mode's example, show this mode's own example.
    const examples = chapter.modeExamples
    let next = values
    if (examples && Object.values(examples).includes(values.expr) && examples[m]) {
      next = { ...values, expr: examples[m] }
      setValues(next)
    }
    setModeState(m)
    setOutcome(compute(chapter.id, next, m))
  }

  return (
    <div className="desk">
      <TitlePage />
      <Contents active={active} onSelect={select} />
      <main className="book" key={active}>
        <InputPage
          chapter={chapter}
          values={values}
          setValues={setValues}
          mode={mode}
          setMode={setMode}
          onCompute={() => setOutcome(compute(chapter.id, values, mode))}
        />
        <div className="spine" aria-hidden="true" />
        <ResultPage chapter={chapter} outcome={outcome} />
      </main>
      <footer className="colophon">
        <Fleuron />
        <p>
          <span className="sc">Finis.</span> Set in the types of the Fell foundry, after the
          manner of the old geometers.
        </p>
      </footer>
    </div>
  )
}
