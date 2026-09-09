export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="sp-toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}
