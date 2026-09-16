import { ChevronLeft, ChevronRight } from "lucide-react";

// pageSizeOptions/onPageSizeChange are optional — pass both to show a page-size
// picker (e.g. an "All" option to flatten everything onto one page); omitting
// them keeps this exactly as a plain prev/next pager.
export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
}) {
  // "all" (from the page-size picker) means one page holding everything.
  const sizeForMath = pageSize === "all" ? Math.max(total, 1) : pageSize;
  const totalPages = Math.max(1, Math.ceil(total / sizeForMath));
  if (total === 0) return null;

  const start = (page - 1) * sizeForMath + 1;
  const end = Math.min(total, page * sizeForMath);
  const showPager = totalPages > 1;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-1 border-t border-mist text-xs text-ink/50">
      <span>
        {start}–{end} of {total}
      </span>
      <div className="flex items-center gap-3">
        {pageSizeOptions && (
          <label className="flex items-center gap-1.5">
            Show
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="rounded-md border border-mist px-1.5 py-1 text-xs"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === "all" ? "All" : opt}
                </option>
              ))}
            </select>
          </label>
        )}
        {showPager && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
              className="flex items-center justify-center rounded-lg border border-mist p-1.5 disabled:opacity-30 hover:bg-mist/50"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 whitespace-nowrap">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              aria-label="Next page"
              className="flex items-center justify-center rounded-lg border border-mist p-1.5 disabled:opacity-30 hover:bg-mist/50"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
