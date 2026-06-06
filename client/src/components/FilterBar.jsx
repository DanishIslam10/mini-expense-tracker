import { CATEGORIES } from "../utils/categories.js";

/*
|--------------------------------------------------------------------------
| Filter Bar
|--------------------------------------------------------------------------
| Controls for narrowing the expense list by category and date range.
| Fully controlled by the parent: it receives the current filters and an
| onChange callback, and never holds filter state itself. Changing any
| control lifts the new filter object up to App, which refetches.
|
| Includes quick presets (This month / Last month) that compute a date
| range, plus a Clear action.
*/

/*
| Helpers to build YYYY-MM-DD strings for month boundaries.
*/

const pad = (n) => String(n).padStart(2, "0");

const toDateString = (year, month, day) =>
    `${year}-${pad(month + 1)}-${pad(day)}`;

const monthRange = (offset) => {

    /*
    | offset 0 = current month, -1 = last month. Returns first and last
    | day of that month as YYYY-MM-DD strings.
    */

    const now = new Date();

    const year = now.getFullYear();

    const month = now.getMonth() + offset;

    const start = new Date(year, month, 1);

    const end = new Date(year, month + 1, 0); // day 0 of next month = last day of this one

    return {
        from: toDateString(start.getFullYear(), start.getMonth(), start.getDate()),
        to: toDateString(end.getFullYear(), end.getMonth(), end.getDate()),
    };
};


const FilterBar = ({ filters, onChange }) => {

    /*
    | Each control updates one field and lifts the merged filter object up.
    */

    const update = (patch) => {
        onChange({ ...filters, ...patch });
    };

    const applyPreset = (offset) => {
        onChange({ ...filters, ...monthRange(offset) });
    };

    const clearAll = () => {
        onChange({ category: "", from: "", to: "" });
    };

    const hasActiveFilter =
        filters.category || filters.from || filters.to;

    const controlBase =
        "rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">

            <div className="flex flex-wrap items-end gap-3">

                <div className="flex flex-col">
                    <label className="mb-1 text-xs font-medium text-gray-600">
                        Category
                    </label>
                    <select
                        value={filters.category}
                        onChange={(e) => update({ category: e.target.value })}
                        className={controlBase}
                    >
                        <option value="">All categories</option>
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="mb-1 text-xs font-medium text-gray-600">
                        From
                    </label>
                    <input
                        type="date"
                        value={filters.from}
                        onChange={(e) => update({ from: e.target.value })}
                        className={controlBase}
                    />
                </div>

                <div className="flex flex-col">
                    <label className="mb-1 text-xs font-medium text-gray-600">
                        To
                    </label>
                    <input
                        type="date"
                        value={filters.to}
                        onChange={(e) => update({ to: e.target.value })}
                        className={controlBase}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => applyPreset(0)}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:border-brand hover:text-brand"
                    >
                        This month
                    </button>
                    <button
                        type="button"
                        onClick={() => applyPreset(-1)}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:border-brand hover:text-brand"
                    >
                        Last month
                    </button>
                </div>

                {hasActiveFilter && (
                    <button
                        type="button"
                        onClick={clearAll}
                        className="ml-auto rounded-lg px-3 py-2 text-xs font-medium text-gray-400 transition hover:text-rose-600"
                    >
                        Clear filters
                    </button>
                )}

            </div>
        </div>
    );
};

export default FilterBar;