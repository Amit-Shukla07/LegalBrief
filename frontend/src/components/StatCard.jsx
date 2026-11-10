const StatCard = ({ title, value, helper, icon }) => (
  <div className="stat-card">
    <div className="stat-card-header">
      <span className="stat-card-label">{title}</span>
      {icon && <div className="stat-icon-wrapper">{icon}</div>}
    </div>
    <div className="stat-card-value">{value}</div>
    {helper && <p className="stat-card-helper">{helper}</p>}
  </div>
);

export default StatCard;
