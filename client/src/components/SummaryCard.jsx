import { formatCurrency } from "../utils/format.js";

/*
|--------------------------------------------------------------------------
| Summary Cards
|--------------------------------------------------------------------------
| Renders the four headline metrics from the /summary endpoint:
| total spent this month, highest single expense, top category, and the
| transaction count. Pure presentational component - it receives the
| summary object and the expense count as props and renders, nothing else.
*/

/*
| Small reusable card so the four tiles stay visually identical.
*/

const Card = ({ label, value, hint }) => {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-2 font-display text-2xl font-semibold tabular">
                {value}
            </p>
            {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
        </div>
    );
};


const SummaryCards = ({ summary, count }) => {

    /*
    | Derive the top category (highest total) from the per-category map.
    | If nothing has been spent this month, fall back to a dash.
    */

    const topCategory = (() => {

        if (!summary || !summary.totalsByCategory) {
            return { name: "—", amount: 0 };
        }

        const entries = Object.entries(summary.totalsByCategory);

        let best = { name: "—", amount: 0 };

        for (const [name, amount] of entries) {
            if (amount > best.amount) {
                best = { name, amount };
            }
        }

        return best;
    })();

    const totalThisMonth = summary?.totalThisMonth ?? 0;

    const highest = summary?.highestExpense ?? null;

    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">

            <Card
                label="Total this month"
                value={formatCurrency(totalThisMonth)}
            />

            <Card
                label="Highest expense"
                value={highest ? formatCurrency(highest.amount) : "—"}
                hint={highest ? highest.note || highest.category : "No expenses yet"}
            />

            <Card
                label="Top category"
                value={topCategory.amount > 0 ? topCategory.name : "—"}
                hint={
                    topCategory.amount > 0
                        ? `${formatCurrency(topCategory.amount)} spent`
                        : "No spending yet"
                }
            />

            <Card
                label="Transactions"
                value={count}
            />

        </div>
    );
};

export default SummaryCards;