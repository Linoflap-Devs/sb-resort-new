import { ArrowUp, ArrowDown } from "lucide-react";

const SortingButton = ({ column }) => {
  const sortedDirection = column.getIsSorted();

  return (
    <button
      onClick={() => {
        if (sortedDirection === "desc") {
          column.clearSorting(); // Clear sorting if already descending
        } else {
          column.toggleSorting(sortedDirection === "asc"); // Toggle between ascending and descending
        }
      }}
      className="rounded-full p-1 transition-colors hover:bg-gray-200"
    >
      {sortedDirection === "asc" ? (
        <ArrowUp className="h-4 w-4" />
      ) : sortedDirection === "desc" ? (
        <ArrowDown className="h-4 w-4" />
      ) : (
        <ArrowUp className="h-4 w-4 opacity-50" /> // Default state (no sorting)
      )}
    </button>
  );
};

export default SortingButton;
