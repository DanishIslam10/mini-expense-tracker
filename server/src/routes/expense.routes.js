import express from "express";
import {
    listExpenses,
    getSummary,
    createExpense,
    updateExpense,
    deleteExpense,
} from "../controllers/expense.controller.js";


const router = express.Router();

router.get("/summary", getSummary);

router.get("/", listExpenses);

router.post("/", createExpense);

router.put("/:id", updateExpense);

router.delete("/:id", deleteExpense);


export default router;