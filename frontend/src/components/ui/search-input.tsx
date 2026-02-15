interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  placeholder?: string;
  resultsCount?: number;
}

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Поиск...',
  resultsCount,
}: SearchInputProps) {
  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full border-2 border-orange-300 rounded-lg px-4 py-2 focus:outline-none focus:border-2 focus:border-orange-400 pl-10 pr-10"
        />

        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {value && (
          <button
            onClick={onClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
            type="button"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {value && resultsCount !== undefined && (
        <p className="text-sm text-gray-600 mt-2">
          {resultsCount === 0
            ? 'Проекты не найдены'
            : `Найдено проектов: ${resultsCount}`}
        </p>
      )}
    </div>
  );
}
