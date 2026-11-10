import Modal from "./Modal";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm action",
  message = "Are you sure you want to proceed? This action cannot be undone.",
  confirmLabel = "Delete",
  confirmVariant = "danger",
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${confirmVariant === "danger" ? "btn-danger" : "btn-primary"} btn-sm`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ margin: 0, fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
        {message}
      </p>
    </Modal>
  );
};

export default ConfirmDialog;
