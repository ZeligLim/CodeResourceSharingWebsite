function ContentCard({ item, admin, onEdit, onRemove }) {
  return (
    <article className="content-card">
      {item.image ? (
        <img className="card-image" src={item.image} alt="" />
      ) : (
        <div className="code-visual" aria-hidden="true">
          <span>const share = async () =&gt; &#123;</span>
          <span>&nbsp;&nbsp;return knowledge.map(build);</span>
          <span>&#125;;</span>
        </div>
      )}

      <div className="card-body">
        <div className="card-meta">
          <span>{item.type}</span>
          <span>/ {item.folder || 'general'}</span>
        </div>
        <h2>{item.title}</h2>
        <p>{item.body}</p>

        {!!item.tags.length && (
          <div className="tag-row">
            {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        )}

        <div className="card-actions">
          {item.url && <a className="primary-button" href={item.url} target="_blank" rel="noreferrer">Open Link</a>}
          {admin && (
            <>
              <button className="plain-button" onClick={onEdit}>Edit</button>
              <button className="danger-button" onClick={onRemove}>Remove</button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export default ContentCard;
