import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";
import { getCategoryStyle } from "../utils/categories.js";
import { formatCurrency } from "../utils/format.js";

/*
|--------------------------------------------------------------------------
| Category Chart
|--------------------------------------------------------------------------
| A donut chart of this month's spending by category, built from the
| summary.totalsByCategory map. Categories with zero spend are dropped so
| the chart only shows what was actually spent. Renders its own empty
| state when there is nothing to plot.
|
| Presentational: receives the summary object and renders.
*/

/*
| Custom tooltip so hovering a slice shows the category and a formatted
| rupee amount instead of the raw number.
*/

const ChartTooltip = ({ active, payload }) => {

    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const slice = payload[0];

    return (
        <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs shadow-md">
            <p className="font-medium text-gray-700">{slice.name}</p>
            <p className="tabular text-gray-500">
                {formatCurrency(slice.value)}
            </p>
        </div>
    );
};


const CategoryChart = ({ summary }) => {

    /*
    | Turn the { Food: 400, Bills: 5700, ... } map into the array Recharts
    | expects, keeping only categories with spend > 0.
    */

    const data = summary?.totalsByCategory
        ? Object.entries(summary.totalsByCategory)
              .map(([name, value]) => ({ name, value }))
              .filter((item) => item.value > 0)
        : [];

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

            <h2 className="mb-4 font-display text-lg font-semibold">
                Spending by category
            </h2>

            {data.length === 0 ? (
                <div className="flex h-56 flex-col items-center justify-center text-center">
                    <p className="text-sm text-gray-400">
                        No spending this month yet
                    </p>
                    <p className="mt-1 text-xs text-gray-300">
                        Add an expense to see the breakdown
                    </p>
                </div>
            ) : (
                <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={85}
                                paddingAngle={2}
                                stroke="none"
                            >
                                {data.map((entry) => (
                                    <Cell
                                        key={entry.name}
                                        fill={getCategoryStyle(entry.name).hex}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<ChartTooltip />} />
                            <Legend
                                iconType="circle"
                                wrapperStyle={{ fontSize: "12px" }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default CategoryChart;