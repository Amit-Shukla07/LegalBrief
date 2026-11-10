const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <header className="page-header">
      <div className="page-title-box">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-description">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
};

export default PageHeader;
