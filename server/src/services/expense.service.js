import crypto from "crypto";
import { readExpenses, writeExpenses } from "../store/expense.store.js";
import { CATEGORIES } from "../config/constants.js";


/*
|--------------------------------------------------------------------------
| Validate Expense Input
|--------------------------------------------------------------------------
| Shared by create and update. Throws a 400 error on the first invalid
| field, and returns a cleaned object with coerced types on success.
*/

const validateExpense = (data) => {

    const { amount, category, date, note } = data || {};

    const numericAmount = Number(amount);

    if (
        amount === undefined ||
        amount === null ||
        amount === "" ||
        Number.isNaN(numericAmount)
    ) {
        const error = new Error("Amount is required and must be a number");
        error.statusCode = 400;
        throw error;
    }

    if (numericAmount <= 0) {
        const error = new Error("Amount must be a positive number");
        error.statusCode = 400;
        throw error;
    }

    if (!category || !CATEGORIES.includes(category)) {
        const error = new Error(
            `Category must be one of: ${CATEGORIES.join(", ")}`
        );
        error.statusCode = 400;
        throw error;
    }

    if (!date || Number.isNaN(Date.parse(date))) {
        const error = new Error("Date is required and must be a valid date");
        error.statusCode = 400;
        throw error;
    }

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    if (new Date(date) > endOfToday) {
        const error = new Error("Date cannot be in the future");
        error.statusCode = 400;
        throw error;
    }

    return {
        amount: numericAmount,
        category,
        date,
        note: typeof note === "string" ? note.trim() : "",
    };
};


/*
|--------------------------------------------------------------------------
| Apply Filters
|--------------------------------------------------------------------------
| Filters the in-memory list by category and an optional date range.
| Dates are stored as YYYY-MM-DD strings, which sort and compare
| correctly as plain strings.
*/

const applyFilters = (expenses, filters) => {

    const { category, from, to } = filters || {};

    let result = [...expenses];

    if (category && CATEGORIES.includes(category)) {
        result = result.filter((e) => e.category === category);
    }

    if (from && !Number.isNaN(Date.parse(from))) {
        result = result.filter((e) => e.date >= from);
    }

    if (to && !Number.isNaN(Date.parse(to))) {
        result = result.filter((e) => e.date <= to);
    }

    return result;
};


/*
|--------------------------------------------------------------------------
| List Expenses
|--------------------------------------------------------------------------
*/

export const listExpensesService = async (filters) => {

    const expenses = await readExpenses();

    const filtered = applyFilters(expenses, filters);

    // Newest first: sort by date, break ties by creation time
    filtered.sort(
        (a, b) =>
            b.date.localeCompare(a.date) ||
            b.createdAt.localeCompare(a.createdAt)
    );

    return filtered;
};


/*
|--------------------------------------------------------------------------
| Get Monthly Summary
|--------------------------------------------------------------------------
| Aggregates the current month's spending: grand total, per-category
| totals, and the single highest expense.
*/

export const getSummaryService = async () => {

    const expenses = await readExpenses();

    const now = new Date();

    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const thisMonth = expenses.filter((e) => e.date.startsWith(ym));

    const totalThisMonth = thisMonth.reduce(
        (sum, e) => sum + e.amount,
        0
    );

    const totalsByCategory = Object.fromEntries(
        CATEGORIES.map((c) => [c, 0])
    );

    for (const e of thisMonth) {
        totalsByCategory[e.category] += e.amount;
    }

    const highestExpense = thisMonth.reduce(
        (max, e) => (e.amount > (max?.amount ?? 0) ? e : max),
        null
    );

    return {
        month: ym,
        totalThisMonth,
        totalsByCategory,
        highestExpense,
    };
};


/*
|--------------------------------------------------------------------------
| Create Expense
|--------------------------------------------------------------------------
*/

export const createExpenseService = async (data) => {

    const value = validateExpense(data);

    const expenses = await readExpenses();

    const newExpense = {
        id: crypto.randomUUID(),
        ...value,
        createdAt: new Date().toISOString(),
    };

    expenses.push(newExpense);

    await writeExpenses(expenses);

    return newExpense;
};


/*
|--------------------------------------------------------------------------
| Update Expense
|--------------------------------------------------------------------------
*/

export const updateExpenseService = async (id, data) => {

    const value = validateExpense(data);

    const expenses = await readExpenses();

    const index = expenses.findIndex((e) => e.id === id);

    if (index === -1) {
        const error = new Error("Expense not found");
        error.statusCode = 404;
        throw error;
    }

    expenses[index] = {
        ...expenses[index],
        ...value,
    };

    await writeExpenses(expenses);

    return expenses[index];
};


/*
|--------------------------------------------------------------------------
| Delete Expense
|--------------------------------------------------------------------------
*/

export const deleteExpenseService = async (id) => {

    const expenses = await readExpenses();

    const index = expenses.findIndex((e) => e.id === id);

    if (index === -1) {
        const error = new Error("Expense not found");
        error.statusCode = 404;
        throw error;
    }

    const [removed] = expenses.splice(index, 1);

    await writeExpenses(expenses);

    return removed;
};