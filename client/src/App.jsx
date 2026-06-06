import { useState, useEffect, useCallback } from "react";
import {
    getExpenses,
    getSummary,
    createExpense,
    updateExpense,
    deleteExpense,
} from "./api/expenses.js";
import SummaryCards from "./components/SummaryCards.jsx";
import CategoryChart from "./components/CategoryChart.jsx";
import ExpenseForm from "./components/ExpenseForm.jsx";
import FilterBar from "./components/FilterBar.jsx";
import ExpenseTable from "./components/ExpenseTable.jsx";

/*
|--------------------------------------------------------------------------
| App
|--------------------------------------------------------------------------
| The single stateful component. It owns the expense list, the monthly
| summary, the active filters, and the loading / error / editing state.
| It is the only place that calls the API client; child components receive
| data via props and report user actions via callbacks.
|
| After any mutation it refetches both the list and the summary, so the UI
| always reflects exactly what the server computed (especially the
| aggregated summary).
*/

const emptyFilters = { category: "", from: "", to: "" };

function App() {

    const [expenses, setExpenses] = useState([]);

    const [summary, setSummary] = useState(null);

    const [filters, setFilters] = useState(emptyFilters);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [editing, setEditing] = useState(null);

    const [submitting, setSubmitting] = useState(false);

    /*
    | Pulls a human-readable message out of an axios error. The backend
    | sends { success: false, message } - we surface that when present,
    | otherwise a generic fallback.
    */

    const readError = (err) => {
        return (
            err?.response?.data?.message ||
            "Something went wrong. Please try again."
        );
    };

    /*
    | Load the list (respecting current filters) and the summary together.
    | Wrapped in useCallback so the effect below has a stable dependency.
    */

    const loadData = useCallback(async () => {

        setLoading(true);
        setError("");

        try {

            const [expensesData, summaryData] = await Promise.all([
                getExpenses(filters),
                getSummary(),
            ]);

            setExpenses(expensesData);
            setSummary(summaryData);

        } catch (err) {

            setError(readError(err));

        } finally {

            setLoading(false);
        }

    }, [filters]);

    /*
    | Refetch whenever filters change (loadData changes with them).
    */

    useEffect(() => {
        loadData();
    }, [loadData]);

    /*
    | Create or update, depending on whether we are editing. On success,
    | clear the edit state and refetch so list + summary stay correct.
    */

    const handleSubmit = async (payload) => {

        setSubmitting(true);
        setError("");

        try {

            if (editing) {
                await updateExpense(editing.id, payload);
            } else {
                await createExpense(payload);
            }

            setEditing(null);
            await loadData();

        } catch (err) {

            setError(readError(err));

        } finally {

            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {

        setError("");

        try {

            await deleteExpense(id);

            /*
            | If we were editing the row we just deleted, leave edit mode.
            */

            if (editing && editing.id === id) {
                setEditing(null);
            }

            await loadData();

        } catch (err) {

            setError(readError(err));
        }
    };

    const handleEdit = (expense) => {
        setEditing(expense);
        /*
        | Scroll up so the form (which is now in edit mode) is visible.
        */
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancelEdit = () => {
        setEditing(null);
    };

    return (
        <div className="min-h-screen">

            <div className="mx-auto max-w-5xl px-4 py-8">

                {/* Header */}
                <header className="mb-6">
                    <h1 className="font-display text-3xl font-bold text-gray-900">
                        Expense tracker
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Log your spending and see where your money goes.
                    </p>
                </header>

                {/* Global error banner */}
                {error && (
                    <div className="mb-6 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        <span>{error}</span>
                        <button
                            onClick={loadData}
                            className="font-medium underline hover:no-underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Summary */}
                <section className="mb-6">
                    <SummaryCards summary={summary} count={expenses.length} />
                </section>

                {/* Form + chart side by side on desktop */}
                <section className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <ExpenseForm
                        editing={editing}
                        onSubmit={handleSubmit}
                        onCancel={handleCancelEdit}
                        submitting={submitting}
                    />
                    <CategoryChart summary={summary} />
                </section>

                {/* Filters */}
                <section className="mb-4">
                    <FilterBar filters={filters} onChange={setFilters} />
                </section>

                {/* List area: loading / empty / data */}
                <section>
                    {loading ? (
                        <div className="space-y-2">
                            {[0, 1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-14 animate-pulse rounded-xl bg-gray-100"
                                />
                            ))}
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
                            <p className="text-sm font-medium text-gray-500">
                                No expenses to show
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                                {filters.category || filters.from || filters.to
                                    ? "Try clearing your filters."
                                    : "Add your first expense above to get started."}
                            </p>
                        </div>
                    ) : (
                        <ExpenseTable
                            expenses={expenses}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    )}
                </section>

            </div>
        </div>
    );
}

export default App;