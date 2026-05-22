function SummaryBand({ items }) {
  return (
    <section className="summary-band">
      <div>
        <span className="metric">{items.filter((item) => item.type === 'link').length}</span>
        <span>Links</span>
      </div>
      <div>
        <span className="metric">{items.filter((item) => item.type === 'text').length}</span>
        <span>Text Notes</span>
      </div>
      <div>
        <span className="metric">{items.filter((item) => item.image).length}</span>
        <span>Pictures</span>
      </div>
    </section>
  );
}

export default SummaryBand;
