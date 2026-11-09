import { useMemo, useRef, useState } from 'react'
import katex from 'katex'
import { CHAPTERS, KEYPAD } from './chapters.js'
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

function InputPage({ chapter, values, setValues, mode, setMode, onCompute }) {
  const exprRef = useRef(null)

  const press = (key) => {
    const el = exprRef.current
    const cur = values.expr ?? ''
    let next
    if (key === '⌫') next = cur.slice(0, -1)
    else if (['sin', 'cos', 'tan', 'ln', 'log', '√'].includes(key)) next = cur + key + '('
    else next = cur + key
    setValues({ ...values, expr: next })
    el?.focus()
  }

  const visibleFields = chapter.fields.filter((f) => !f.onlyFor || f.onlyFor === mode)

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
        <span className="drop-cap">{chapter.initial}</span>
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
          {visibleFields.map((f, i) => (
            <label key={f.key} className={f.short ? 'field short' : 'field'}>
              <span className="field-label">{f.label}</span>
              <input
                ref={i === 0 ? exprRef : undefined}
                value={values[f.key] ?? ''}
                placeholder={f.placeholder}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                spellCheck="false"
                autoComplete="off"
              />
            </label>
          ))}
        </div>

        <div className="tablet" aria-label="Reckoning tablet">
          {KEYPAD.flat().map((k) => (
            <button type="button" key={k} className="key" onClick={() => press(k)}>
              {k === '^' ? 'xⁿ' : k}
            </button>
          ))}
        </div>

        <div className="seal-row">
          <button type="button" className="clear-link" onClick={() => setValues({})}>
            Erase the slate
          </button>
          <button type="submit" className="seal" aria-label="Compute">
            <span>Q.E.F.</span>
          </button>
        </div>
      </form>

      <div className="folio">— {chapter.numeral.toLowerCase()} —</div>
    </section>
  )
}

function ResultPage({ chapter, shown }) {
  const s = chapter.sample
  return (
    <section className="page page-right" aria-live="polite">
      <div className="page-head">
        <span>The Demonstration</span>
        <span>Propositio</span>
      </div>

      <MarginFigure />

      {!shown ? (
        <div className="awaiting">
          <p className="awaiting-text">
            Inscribe thy quantity upon the facing leaf, and press the seal, that the
            demonstration may here be written.
          </p>
          <Fleuron />
        </div>
      ) : (
        <article className="demonstration">
          <h3 className="prop-heading">Proposition. Given</h3>
          <div className="given">
            <Tex expr={s.given} display />
          </div>

          <h3 className="prop-heading">Demonstration</h3>
          <ol className="steps">
            {s.steps.map((st, i) => (
              <li key={i}>
                <span className="step-note">{st.note},</span>
                <Tex expr={st.tex} display />
              </li>
            ))}
          </ol>

          <h3 className="prop-heading">Therefore</h3>
          <div className="result-box">
            <Tex expr={s.result} display />
          </div>
          <p className="qed">Which was to be found.</p>
          <p className="design-note">
            ✠ A specimen plate — the true engine of reckoning shall be fitted in the next
            stage.
          </p>
        </article>
      )}

      <div className="folio">— {chapter.numeral.toLowerCase()} · verso —</div>
    </section>
  )
}

export default function App() {
  const [active, setActive] = useState(CHAPTERS[0].id)
  const chapter = CHAPTERS.find((c) => c.id === active)
  const [values, setValues] = useState({})
  const [mode, setMode] = useState(chapter.actions?.[0])
  const [shown, setShown] = useState(true)

  const select = (id) => {
    const c = CHAPTERS.find((x) => x.id === id)
    setActive(id)
    setValues({})
    setMode(c.actions?.[0])
    setShown(true)
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
          onCompute={() => setShown(true)}
        />
        <div className="spine" aria-hidden="true" />
        <ResultPage chapter={chapter} shown={shown} />
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
