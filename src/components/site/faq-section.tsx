import { FAQS } from '@/lib/site'

export function FaqSection() {
  return (
    <section
      className="section faq-section"
      id="faq"
      aria-labelledby="faq-title"
    >
      <div className="container">
        <div className="section-heading section-heading--split">
          <h2 id="faq-title">Common questions before you arrive</h2>
          <p className="lead">
            Straight answers on the house, the garden, rates and how Mrs Ncube
            confirms your dates.
          </p>
        </div>

        <div className="faq-list">
          {FAQS.map((item, index) => (
            <details
              key={item.question}
              className="faq-item"
              name="pinkhouse-faq"
              open={index === 0}
            >
              <summary className="faq-item__summary">
                <span className="faq-item__index num">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="faq-item__question">{item.question}</span>
                <span className="faq-item__icon" aria-hidden="true" />
              </summary>
              <div className="faq-item__body">
                <p>{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
