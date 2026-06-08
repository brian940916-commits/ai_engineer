export interface ToastData {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface Props {
  toast: ToastData | null;
}

// Transient, gentle pill toast (auto-dismiss is managed by App). Never alarming.
export function Toast({ toast }: Props) {
  if (!toast) return null;
  return (
    <div className={`toast toast--${toast.type}`} role="status" aria-live="polite">
      {toast.message}
    </div>
  );
}
