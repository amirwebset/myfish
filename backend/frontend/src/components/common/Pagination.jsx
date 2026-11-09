import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  lastPage = 1,
  total = 0,
  perPage = 12,
  onPageChange,
}) {
  if (!lastPage || lastPage <= 1) {
    return null;
  }

  const from = (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (lastPage <= maxVisible) {
      for (let i = 1; i <= lastPage; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 1);
      let end = Math.min(lastPage, currentPage + 1);

      if (currentPage <= 2) {
        end = 4;
      } else if (currentPage >= lastPage - 1) {
        start = lastPage - 3;
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < lastPage) {
        if (end < lastPage - 1) pages.push('...');
        pages.push(lastPage);
      }
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
      {total > 0 && (
        <p className="text-xs text-slate-500 font-medium">
          Menampilkan <strong className="text-slate-800 font-bold">{from}</strong> - <strong className="text-slate-800 font-bold">{to}</strong> dari <strong className="text-slate-800 font-bold">{total}</strong> data
        </p>
      )}

      <div className="flex items-center gap-1.5 self-center sm:self-auto">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-ocean-600 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
          title="Halaman Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Number Buttons */}
        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 text-xs text-slate-400 select-none">
                ...
              </span>
            );
          }

          const isActive = p === currentPage;
          return (
            <button
              key={`page-${p}`}
              onClick={() => onPageChange(p)}
              className={`min-w-[36px] h-9 px-2 rounded-xl text-xs font-bold transition shadow-2xs ${
                isActive
                  ? 'bg-ocean-600 text-white shadow-md shadow-ocean-600/20'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-ocean-600'
              }`}
            >
              {p}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-ocean-600 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
          title="Halaman Selanjutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

