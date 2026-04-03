import React from 'react';

const PageButton = ({ page, isActive, isDisabled, onClick }) => (
    <button
        onClick={() => onClick(page)}
        disabled={isDisabled}
        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${isActive
                ? 'bg-primary-500 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        {page}
    </button>
);

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const handlePrev = () => onPageChange(currentPage - 1);
    const handleNext = () => onPageChange(currentPage + 1);

    return (
        <div className="flex items-center justify-center gap-3 pt-3">
            <button
                className="btn-outline !py-1.5 !px-4 !text-xs"
                disabled={currentPage === 1}
                onClick={handlePrev}
            >
                ← Назад
            </button>
            <span className="text-sm text-slate-500 font-medium">
                Стр. {currentPage} из {totalPages}
            </span>
            <button
                className="btn-outline !py-1.5 !px-4 !text-xs"
                disabled={currentPage === totalPages}
                onClick={handleNext}
            >
                Вперёд →
            </button>
        </div>
    );
}