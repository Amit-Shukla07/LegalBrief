import { useEffect } from "react";
import { CloseIcon } from "./Icons";

const Modal = ({ isOpen, onClose, title, children, footer, size = "md" }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`modal-dialog ${size === "lg" ? "modal-dialog-lg" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-bar">
          <h2 className="modal-title-text">{title}</h2>
          <button
            type="button"
            className="modal-close-icon"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon size={16} />
          </button>
        </div>
        <div className="modal-content-body">{children}</div>
        {footer && <div className="modal-footer-bar">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
