import { useState, useEffect } from "react";
import { CATEGORIES } from "../utils/categories.js";

/*
|--------------------------------------------------------------------------
| Expense Form
|--------------------------------------------------------------------------
| Handles both adding a new expense and editing an existing one. When
| `editing` is provided, the form pre-fills with that expense and switches
| to "update" mode; otherwise it is a blank "add" form.
|
| Client-side validation mirrors the server rules (positive amount, no
| future date, category required) so the user gets instant feedback. The
| server still re-validates - this is a convenience layer, not the guard.
*/

/*
| Today's date as YYYY-MM-DD, used as the date input's max (no future
| dates) and as the default date for a new expense.
*/

const todayString = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60 * 1000);
    return local.toISOString().split("T")[0];
};


const emptyForm = () => ({
    amount: "",
    category: "Food",
    date: todayString(),
    note: "",
});


const ExpenseForm = ({ editing, onSubmit, onCancel, submitting }) => {

    const [form, setForm] = useState(emptyForm());

    const [errors, setErrors] = useState({});

    /*
    | When `editing` changes, sync the form. Switching from add -> edit
    | fills the fields; clearing it (back to add) resets to blank.
    */

    useEffect(() => {

        if (editing) {
            setForm({
                amount: String(editing.amount),
                category: editing.category,
                date: editing.date,
                note: editing.note || "",
            });
        } else {
            setForm(emptyForm());
        }

        setErrors({});

    }, [editing]);


    const handleChange = (field) => (event) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };


    /*
    | Validate against the same rules the server enforces. Returns an
    | object of field -> message; empty means valid.
    */

    const validate = () => {

        const nextErrors = {};

        const amountNumber = Number(form.amount);

        if (form.amount === "" || Number.isNaN(amountNumber)) {
            nextErrors.amount = "Amount is required";
        } else if (amountNumber <= 0) {
            nextErrors.amount = "Amount must be greater than zero";
        }

        if (!CATEGORIES.includes(form.category)) {
            nextErrors.category = "Pick a category";
        }

        if (!form.date) {
            nextErrors.date = "Date is required";
        } else if (form.date > todayString()) {
            nextErrors.date = "Date cannot be in the future";
        }

        return nextErrors;
    };


    const handleSubmit = (event) => {

        event.preventDefault();

        const nextErrors = validate();

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        /*
        | Hand a clean payload up to the parent. We coerce amount to a
        | number and trim the note here so the parent/API get tidy data.
        */

        onSubmit({
            amount: Number(form.amount),
            category: form.category,
            date: form.date,
            note: form.note.trim(),
        });
    };


    const inputBase =
        "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
        >
            <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">
                    {editing ? "Edit expense" : "Add expense"}
                </h2>
                {editing && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-xs text-gray-400 hover:text-gray-600"
                    >
                        Cancel
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                        Amount (₹)
                    </label>
                    <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        value={form.amount}
                        onChange={handleChange("amount")}
                        placeholder="0.00"
                        className={inputBase}
                    />
                    {errors.amount && (
                        <p className="mt-1 text-xs text-rose-600">{errors.amount}</p>
                    )}
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                        Category
                    </label>
                    <select
                        value={form.category}
                        onChange={handleChange("category")}
                        className={inputBase}
                    >
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                    {errors.category && (
                        <p className="mt-1 text-xs text-rose-600">{errors.category}</p>
                    )}
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                        Date
                    </label>
                    <input
                        type="date"
                        value={form.date}
                        max={todayString()}
                        onChange={handleChange("date")}
                        className={inputBase}
                    />
                    {errors.date && (
                        <p className="mt-1 text-xs text-rose-600">{errors.date}</p>
                    )}
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                        Note (optional)
                    </label>
                    <input
                        type="text"
                        value={form.note}
                        onChange={handleChange("note")}
                        placeholder="e.g. Lunch"
                        className={inputBase}
                    />
                </div>

            </div>

            <button
                type="submit"
                disabled={submitting}
                className="mt-4 w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
                {submitting
                    ? "Saving..."
                    : editing
                    ? "Update expense"
                    : "Add expense"}
            </button>
        </form>
    );
};

export default ExpenseForm;