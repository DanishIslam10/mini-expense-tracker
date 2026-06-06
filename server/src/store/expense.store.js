import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/*
|--------------------------------------------------------------------------
| Paths
|--------------------------------------------------------------------------
| Resolve the data file relative to this module so it works no matter
| where the process is started from.
*/

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATA_DIR = path.join(__dirname, "..", "..", "data");

const DATA_FILE = path.join(DATA_DIR, "expenses.json");


/*
|--------------------------------------------------------------------------
| Ensure Storage Exists
|--------------------------------------------------------------------------
| Create the data directory and an empty JSON array file on first use,
| so reads never fail just because nothing has been written yet.
*/

const ensureFile = async () => {

    if (!existsSync(DATA_DIR)) {
        await mkdir(DATA_DIR, { recursive: true });
    }

    if (!existsSync(DATA_FILE)) {
        await writeFile(DATA_FILE, "[]", "utf-8");
    }
};


/*
|--------------------------------------------------------------------------
| Read All Expenses
|--------------------------------------------------------------------------
*/

export const readExpenses = async () => {

    await ensureFile();

    const raw = await readFile(DATA_FILE, "utf-8");

    try {

        return JSON.parse(raw);

    } catch (error) {

        // If the file is somehow corrupted, fail soft with an empty list
        // rather than crashing the whole request.
        return [];

    }
};


/*
|--------------------------------------------------------------------------
| Write All Expenses
|--------------------------------------------------------------------------
*/

export const writeExpenses = async (expenses) => {

    await ensureFile();

    await writeFile(
        DATA_FILE,
        JSON.stringify(expenses, null, 2),
        "utf-8"
    );
};