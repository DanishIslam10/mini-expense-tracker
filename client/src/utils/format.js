/*
|--------------------------------------------------------------------------
| Currency Formatter
|--------------------------------------------------------------------------
| Formats a number as Indian Rupees with locale-aware grouping, e.g.
| 1234.5 -> "₹1,234.50". Uses Intl so we never hand-roll comma logic.
*/

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export const formatCurrency = (amount) => {

    const value = Number(amount);

    if (Number.isNaN(value)) {
        return currencyFormatter.format(0);
    }

    return currencyFormatter.format(value);
};


/*
|--------------------------------------------------------------------------
| Date Formatter
|--------------------------------------------------------------------------
| Turns a "YYYY-MM-DD" string into a readable "6 Jun 2026".
*/

export const formatDate = (dateString) => {

    if (!dateString) return "";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};