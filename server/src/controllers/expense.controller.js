import {
    listExpensesService,
    getSummaryService,
    createExpenseService,
    updateExpenseService,
    deleteExpenseService,
} from "../services/expense.service.js";


/*
|--------------------------------------------------------------------------
| List Expenses
|--------------------------------------------------------------------------
| GET /api/v1/expenses?category=&from=&to=
*/

export const listExpenses = async (req, res) => {

    try {

        const filters = {
            category: req.query.category,
            from: req.query.from,
            to: req.query.to,
        };

        const expenses = await listExpensesService(filters);

        return res.status(200).json({
            success: true,
            expenses,
        });

    } catch (error) {

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message: error.message,
        });

    }
};


/*
|--------------------------------------------------------------------------
| Get Monthly Summary
|--------------------------------------------------------------------------
| GET /api/v1/expenses/summary
*/

export const getSummary = async (req, res) => {

    try {

        const summary = await getSummaryService();

        return res.status(200).json({
            success: true,
            summary,
        });

    } catch (error) {

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message: error.message,
        });

    }
};


/*
|--------------------------------------------------------------------------
| Create Expense
|--------------------------------------------------------------------------
| POST /api/v1/expenses
*/

export const createExpense = async (req, res) => {

    try {

        const expense = await createExpenseService(req.body);

        return res.status(201).json({
            success: true,
            expense,
        });

    } catch (error) {

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message: error.message,
        });

    }
};


/*
|--------------------------------------------------------------------------
| Update Expense
|--------------------------------------------------------------------------
| PUT /api/v1/expenses/:id
*/

export const updateExpense = async (req, res) => {

    const { id } = req.params;

    try {

        const expense = await updateExpenseService(id, req.body);

        return res.status(200).json({
            success: true,
            expense,
        });

    } catch (error) {

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message: error.message,
        });

    }
};


/*
|--------------------------------------------------------------------------
| Delete Expense
|--------------------------------------------------------------------------
| DELETE /api/v1/expenses/:id
*/

export const deleteExpense = async (req, res) => {

    const { id } = req.params;

    try {

        const removed = await deleteExpenseService(id);

        return res.status(200).json({
            success: true,
            expense: removed,
        });

    } catch (error) {

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message: error.message,
        });

    }
};