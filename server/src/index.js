import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import expenseRouter from "./routes/expense.routes.js";


dotenv.config();

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());

app.use("/api/v1/expenses", expenseRouter);

app.get("/", (req, res) => {
    res.send(
        `Server is running.\nCors domain: ${process.env.CLIENT_URL}`
    );
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});