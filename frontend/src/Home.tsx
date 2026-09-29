import type { View } from './Nav'

type Props = {
  onNavigate: (view: View) => void
  libraryCount: number
}

const FEATURES = [
  {
    title: 'Import your own course',
    body: 'PowerPoint and PDF files, however long. Page and slide numbers are kept through extraction, so nothing loses its place.',
  },
  {
    title: 'A summary you can check',
    body: 'Every section says which pages or slides it was built from. Automatic checks flag a section citing a page the course does not have.',
  },
  {
    title: 'Yours to correct',
    body: 'Rewrite a heading, reorder sections, drop what you already know. The version written for you is kept aside and one click brings it back.',
  },
  {
    title: 'Two A4 pages',
    body: 'Print it or save it as a PDF straight from the browser. A gauge warns you before a sheet grows past what will fit.',
  },
  {
    title: 'Revise with flashcards',
    body: 'Each section becomes a card: the heading asks, the key ideas answer. Cards follow your edits, so they are never out of date.',
  },
  {
    title: 'A library by subject',
    body: 'Tag each sheet with its subject, then filter. Everything you make stays, so you can come back to it the week before the exam.',
  },
]

const STEPS = [
  { title: 'Upload your course', body: 'A lecture as a PDF or a PowerPoint file.' },
  {
    title: 'Read it against the sources',
    body: 'Each section points at the pages it came from, so you can verify it.',
  },
  {
    title: 'Correct what is wrong',
    body: 'A summary compresses. You decide what matters and rewrite the rest.',
  },
  {
    title: 'Revise and print',
    body: 'Flashcards for recall, two A4 pages for the day before.',
  },
]

export function Home({ onNavigate, libraryCount }: Props) {
  return (
    <div className="home">
      <section className="hero">
        <p className="hero-eyebrow">Revision tool</p>
        <h1 className="hero-title">StudyCard</h1>
        <p className="hero-lead">
          Turn a long lecture into a two-page study sheet you can check, correct,
          print and revise — with every section linked back to the slide it came
          from.
        </p>
        <div className="hero-actions">
          <button type="button" className="primary" onClick={() => onNavigate('upload')}>
            Create a study sheet
          </button>
          <button type="button" onClick={() => onNavigate('library')}>
            {libraryCount > 0
              ? `Open my library (${libraryCount})`
              : 'My library is empty'}
          </button>
        </div>
      </section>

      <section className="home-section">
        <h2>What it does</h2>
        <div className="feature-grid">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <h2>How it works</h2>
        <ol className="step-list">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <span className="step-number" aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Saying this on the front page is deliberate: a study tool that hides
          its limits is worse than one that states them. */}
      <section className="home-section">
        <h2>What it does not do</h2>
        <ul className="limit-list">
          <li>
            <strong>It does not read scans.</strong> Files whose pages hold no text,
            such as photographed course notes, are refused with an explanation
            rather than summarised into nothing.
          </li>
          <li>
            <strong>It does not replace the course.</strong> Two pages mean choosing
            and compressing. The source references are there so you can check what
            was kept, and what was dropped.
          </li>
          <li>
            <strong>A reference is not a proof.</strong> A section citing slide 7
            was built from slide 7. Whether slide 7 really supports it is something
            only you can confirm.
          </li>
        </ul>
      </section>
    </div>
  )
}
