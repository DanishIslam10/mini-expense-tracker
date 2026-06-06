/*
|--------------------------------------------------------------------------
| CSV Export
|--------------------------------------------------------------------------
| Turns an array of expenses into a CSV file and triggers a browser
| download. Done entirely client-side from the currently visible
| (filtered) list, so "export" always matches what the user sees.
*/

/*
| Escapes a single CSV field: wraps it in quotes and doubles any quotes
| inside, so values containing commas, quotes, or newlines stay intact.
*/

const escapeField = (value) => {
    const str = String(value ?? "");
    return `"${str.replace(/"/g, '""')}"`;
};


export const exportExpensesToCsv = (expenses) => {

    if (!expenses || expenses.length === 0) {
        return;
    }

    const headers = ["Date", "Category", "Note", "Amount"];

    /*
    | Build each row in the same column order as the headers.
    */

    const rows = expenses.map((e) => [
        e.date,
        e.category,
        e.note || "",
        e.amount,
    ]);

    /*
    | Join into CSV text: headers first, then each row, each field escaped.
    */

    const csvContent = [headers, ...rows]
        .map((row) => row.map(escapeField).join(","))
        .join("\n");

    /*
    | Wrap in a Blob and create a temporary object URL to download from.
    | The leading \uFEFF is a BOM so Excel opens UTF-8 correctly.
    */

    const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    const today = new Date().toISOString().split("T")[0];

    link.href = url;
    link.download = `expenses-${today}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
};