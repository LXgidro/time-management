interface SubmitButtonProps {
  isSubmitting: boolean;
  isValid?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function SubmitButton({
  isSubmitting,
  isValid = true,
  loadingText = 'Загрузка...',
  children,
  className = '',
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isSubmitting || !isValid}
      className={`w-50 py-3 px-4 rounded-lg border-2 border-orange-300 hover:bg-orange-300 hover:border-orange-400 text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {isSubmitting ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
