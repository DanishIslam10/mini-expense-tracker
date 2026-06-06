/*
|--------------------------------------------------------------------------
| Categories
|--------------------------------------------------------------------------
| The same fixed set the backend validates against, plus a colour per
| category used by the table pills and the chart. Kept in one place so
| every component renders categories consistently.
*/

export const CATEGORIES = [
    "Food",
    "Transport",
    "Bills",
    "Entertainment",
    "Other",
];

/*
| Tailwind utility classes for the coloured pill in the table / form.
| `hex` is for Recharts, which needs a raw colour value, not a class.
*/

export const CATEGORY_STYLES = {
    Food: { pill: "bg-amber-100 text-amber-800", hex: "#d97706" },
    Transport: { pill: "bg-sky-100 text-sky-800", hex: "#0284c7" },
    Bills: { pill: "bg-rose-100 text-rose-800", hex: "#e11d48" },
    Entertainment: { pill: "bg-violet-100 text-violet-800", hex: "#7c3aed" },
    Other: { pill: "bg-gray-100 text-gray-700", hex: "#6b7280" },
};

/*
| Safe fallback for an unexpected category, so the UI never breaks.
*/

export const getCategoryStyle = (category) => {
    return CATEGORY_STYLES[category] || CATEGORY_STYLES.Other;
};