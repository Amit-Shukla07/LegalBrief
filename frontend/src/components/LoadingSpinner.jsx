const LoadingSpinner = ({ label = "Loading..." }) => {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <span style={{ fontSize: "0.88rem", fontWeight: 500 }}>{label}</span>
    </div>
  );
};

export default LoadingSpinner;

