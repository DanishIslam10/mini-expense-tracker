import api from "./axios.js";

/*
|--------------------------------------------------------------------------
| Expenses API Client
|--------------------------------------------------------------------------
| One function per backend endpoint. This is the only module that knows
| the API's URL shape and response envelope. Components call these
| functions and receive clean data, never raw axios responses.
*/

/*
|--------------------------------------------------------------------------
| List Expenses
|--------------------------------------------------------------------------
| Accepts optional filters { category, from, to } and forwards them as
| query params. Returns the expenses array.
*/

export const getExpenses = async (filters = {}) => {

    const params = {};

    if (filters.category) params.category = filters.category;
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;

    const response = await api.get("/expenses", { params });

    return response.data.expenses;
};


/*
|--------------------------------------------------------------------------
| Get Monthly Summary
|--------------------------------------------------------------------------
*/

export const getSummary = async () => {

    const response = await api.get("/expenses/summary");

    return response.data.summary;
};


/*
|--------------------------------------------------------------------------
| Create Expense
|--------------------------------------------------------------------------
*/

export const createExpense = async (data) => {

    const response = await api.post("/expenses", data);

    return response.data.expense;
};


/*
|--------------------------------------------------------------------------
| Update Expense
|--------------------------------------------------------------------------
*/

export const updateExpense = async (id, data) => {

    const response = await api.put(`/expenses/${id}`, data);

    return response.data.expense;
};


/*
|--------------------------------------------------------------------------
| Delete Expense
|--------------------------------------------------------------------------
*/

export const deleteExpense = async (id) => {

    const response = await api.delete(`/expenses/${id}`);

    return response.data.expense;
};