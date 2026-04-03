export default function Pagination({ page, total, limit = 20, onPageChange }) {
    const totalPages = Math.ceil(total / limit)

    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-center gap-2 pt-4">
            <button
                className="btn-outline !py-1 !px-3 !text-xs"
                disabled={page === 1}
                onClick={() => onPageChange(page - 1)}
            >
                ◀
            </button>
            <span className="text-sm text-stone-600">
                {page} / {totalPages}
            </span>
            <button
                className="btn-outline !py-1 !px-3 !text-xs"
                disabled={page === totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                ▶
            </button>
        </div>
    )
}