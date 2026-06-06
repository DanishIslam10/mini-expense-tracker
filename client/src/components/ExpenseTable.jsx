import { useState } from "react";
import { formatCurrency, formatDate } from "../utils/format.js";
import { getCategoryStyle } from "../utils/categories.js";

/*
|--------------------------------------------------------------------------
| Expense Table
|--------------------------------------------------------------------------
| Renders the list of expenses as a table on larger screens and as stacked
| cards on mobile. Each row exposes edit and delete actions. Delete asks
| for confirmation inline (the row turns into a confirm prompt) rather than
| using a native window.confirm, so it stays on-brand and accessible.
|
| Presentational: receives expenses + callbacks, holds only the tiny bit
| of UI state for "which row is mid-delete-confirmation".
*/

/*
| A coloured category pill, shared by both the table and mobile layouts.
*/

const CategoryPill = ({ category }) => {
    const style = getCategoryStyle(category);
    return (
        <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${style.pill}`}
        >
            {category}
        </span>
    );
};


const ExpenseTable = ({ expenses, onEdit, onDelete }) => {

    /*
    | Tracks the id of the row currently asking "are you sure?". Only one
    | row can be in this state at a time.
    */

    const [confirmingId, setConfirmingId] = useState(null);

    const handleDeleteClick = (id) => {
        setConfirmingId(id);
    };

    const handleConfirmDelete = (id) => {
        setConfirmingId(null);
        onDelete(id);
    };

    /*
    | Action buttons reused in both desktop and mobile layouts.
    */

    const RowActions = ({ expense }) => {

        if (confirmingId === expense.id) {
            return (
                <div className="flex items-center justify-end gap-2">
                    <span className="text-xs text-gray-500">Delete?</span>
                    <button
                        onClick={() => handleConfirmDelete(expense.id)}
                        className="rounded-md bg-rose-600 px-2 py-1 text-xs font-medium text-white hover:bg-rose-700"
                    >
                        Yes
                    </button>
                    <button
                        onClick={() => setConfirmingId(null)}
                        className="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                        No
                    </button>
                </div>
            );
        }

        return (
            <div className="flex items-center justify-end gap-3">
                <button
                    onClick={() => onEdit(expense)}
                    className="text-xs font-medium text-gray-500 transition hover:text-brand"
                >
                    Edit
                </button>
                <button
                    onClick={() => handleDeleteClick(expense.id)}
                    className="text-xs font-medium text-gray-500 transition hover:text-rose-600"
                >
                    Delete
                </button>
            </div>
        );
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

            {/* Desktop / tablet: real table */}
            <table className="hidden w-full sm:table">
                <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60 text-left">
                        <th className="px-5 py-3 text-xs font-semibold text-gray-500">Date</th>
                        <th className="px-5 py-3 text-xs font-semibold text-gray-500">Category</th>
                        <th className="px-5 py-3 text-xs font-semibold text-gray-500">Note</th>
                        <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500">Amount</th>
                        <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500"></th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map((expense) => (
                        <tr
                            key={expense.id}
                            className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                        >
                            <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-600">
                                {formatDate(expense.date)}
                            </td>
                            <td className="px-5 py-3">
                                <CategoryPill category={expense.category} />
                            </td>
                            <td className="px-5 py-3 text-sm text-gray-700">
                                {expense.note || <span className="text-gray-300">—</span>}
                            </td>
                            <td className="whitespace-nowrap px-5 py-3 text-right text-sm font-semibold tabular text-gray-900">
                                {formatCurrency(expense.amount)}
                            </td>
                            <td className="px-5 py-3">
                                <RowActions expense={expense} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Mobile: stacked cards */}
            <div className="divide-y divide-gray-50 sm:hidden">
                {expenses.map((expense) => (
                    <div key={expense.id} className="p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <CategoryPill category={expense.category} />
                                <p className="mt-1.5 text-sm text-gray-700">
                                    {expense.note || <span className="text-gray-300">No note</span>}
                                </p>
                                <p className="mt-0.5 text-xs text-gray-400">
                                    {formatDate(expense.date)}
                                </p>
                            </div>
                            <p className="text-base font-semibold tabular text-gray-900">
                                {formatCurrency(expense.amount)}
                            </p>
                        </div>
                        <div className="mt-3">
                            <RowActions expense={expense} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExpenseTable;