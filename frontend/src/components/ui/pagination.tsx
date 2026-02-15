import { useMemo } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages = useMemo(() => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pageNumbers.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className="px-3 py-1 rounded-lg border-2 border-orange-300 hover:border-orange-400 hover:bg-orange-300 transition-colors"
        >
          1
        </button>,
      );
      if (startPage > 2) {
        pageNumbers.push(
          <span key="dots1" className="px-2">
            ...
          </span>,
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 rounded-lg transition-colors ${
            currentPage === i
              ? 'bg-orange-300 border-2 border-orange-300 hover:border-orange-400'
              : 'border-2 border-orange-300 hover:border-orange-400 hover:bg-orange-300'
          }`}
        >
          {i}
        </button>,
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <span key="dots2" className="px-2">
            ...
          </span>,
        );
      }
      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className="px-3 py-1 rounded-lg border-2 border-orange-300 hover:border-orange-400 hover:bg-orange-300 transition-colors"
        >
          {totalPages}
        </button>,
      );
    }

    return pageNumbers;
  }, [currentPage, totalPages, onPageChange]);

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg border-2 border-orange-300 hover:border-orange-400 hover:bg-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        ←
      </button>

      <div className="flex items-center gap-1">{pages}</div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg border-2 border-orange-300 hover:border-orange-400 hover:bg-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        →
      </button>
    </div>
  );
}
