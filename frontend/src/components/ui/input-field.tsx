import type { UseFormRegisterReturn } from 'react-hook-form';

interface InputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  error?: { message?: string };
  register: UseFormRegisterReturn;
  autoComplete?: string;
  disabled?: boolean;
  className?: string;
  successMessage?: string;
}

export function InputField({
  label,
  type = 'text',
  placeholder,
  error,
  register,
  autoComplete,
  disabled = false,
  className = '',
  successMessage,
}: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        type={type}
        className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-colors ${
          error
            ? 'border-red-300 focus:border-red-500'
            : 'border-gray-200 focus:border-orange-400'
        }${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        disabled={disabled}
        {...register}
      />
      <div className="min-h-5 mt-1">
        {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
        {!error && successMessage && (
          <p className="text-sm text-green-600 mt-1">{successMessage}</p>
        )}
      </div>
    </div>
  );
}
