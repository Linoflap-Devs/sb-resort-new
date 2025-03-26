"use client";
import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import {
  ColumnDef,
  ColumnFiltersState,
  ColumnSort,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
import { useEffect } from "react";
import { useTranslation } from "next-export-i18n";
import { FilterByCol } from "@/types";
import SortingButton from "./SortingButton";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title?: string;
  description?: string;
  columnToSearch: string[];
  searchPlaceholder?: string;
  className?: string;
  visibility?: any;
  columnToFilter?: any;
  pageSize?: number;
  pagination?: boolean;
  isLoading?: boolean;
  filterByCol?: FilterByCol[];
  initialSort?: ColumnSort[];
  setPage?: (page: number) => void;
}
export default function DetailedDataTable<TData, TValue>({
  title = "Titlee",
  data = [],
  columns,
  columnToSearch = [],
  searchPlaceholder = "Search",
  className = "",
  pageSize = 20,
  visibility = {},
  columnToFilter = [],
  pagination = data.length > pageSize,
  isLoading = false,
  filterByCol = [],
  initialSort = [],
  setPage,
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation();
  const generalI18n = t("general");

  const [sorting, setSorting] = React.useState<SortingState>(initialSort);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([
    ...columnToFilter,
  ]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({ ...visibility });
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState<string>("");

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      columnVisibility: columnVisibility,
      rowSelection,
    },
    initialState: {
      columnFilters: columnFilters,
      columnVisibility: columnVisibility,
      pagination: {
        pageSize: pageSize,
      },
      sorting: initialSort,
    },

    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = filterValue.toLowerCase();
      //iterates over each column,--returns true if any columns matches the search input.
      return columnToSearch.some((col: any) => {
        //fetches value of the current col in the iteratiion
        let cellValue = row.getValue(col);

        // Special handling for full name search
        if (col === "FirstName" || col === "LastName") {
          const firstName = row.getValue("FirstName") ?? "";
          const lastName = row.getValue("LastName") ?? "";
          const fullName = `${firstName} ${lastName}`.replace(/\s+/g, " ").trim().toLowerCase();
          return fullName.includes(searchValue);
        }
      
        // Special handling for date searching in "MMM dd, yyyy" format
        if (col === "ChangedAt" && cellValue) {
          let dateValue;
          //check if cellValue is string/number to ensure it can be converted to a valid date
          if (typeof cellValue === "string" || typeof cellValue === "number") {
            //comverts raw data to valid date
            //Fri Aug 09 2024 09:52 AM format
            dateValue = new Date(cellValue); // Convert to Date
          }
          //ensures date conversion was successful
          if (dateValue && isValid(dateValue)) {
            //removes time
            cellValue = format(dateValue, "MMM dd, yyyy");
          } else {
            return false; // Ignore invalid dates
          }
        }

        // Special handling for "CreatedAt" and "ExpiredAt" (Promo Dates)
        if (
          (col === "CreatedAt" || col === "ExpiredAt") &&
          typeof cellValue === "string" &&
          cellValue
        ) {
          const dateValue = new Date(cellValue);
          if (isValid(dateValue)) {
            cellValue = format(dateValue, "MMM yyyy"); // Jul 2024
          } else {
            return false;
          }
        }
        return cellValue?.toString().toLowerCase().includes(searchValue);
      });
    },
  });

  useEffect(() => {
    filterByCol.map((item) => {
      table.getColumn(item.column)?.setFilterValue(item.filterValue);
    });
  }, [filterByCol]);

  return (
    <Card className={`${cn(className)} border-2 bg-cstm-card shadow-sm`}>
      <h5 className="text-lg rounded-t-md bg-cstm-primary p-4 font-semibold tracking-tight text-cstm-tertiary">
        {title}
      </h5>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-4 pt-0">
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(event) => {
              setGlobalFilter(event.target.value);
            }}            
            className="max-w-sm"
          />

          <div className="ml-auto flex space-x-4">
            {/*             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  {generalI18n.columns} <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu> */}
          </div>
        </div>
        <div className="overflow-hidden rounded-md border border-cstm-tertiary">
          {isLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <>
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead
                            className=" font-semibold text-cstm-tertiary" // Add text-center
                            key={header.id}
                          >
                            <div className="flex items-center justify-center text-center gap-2">
                              {" "}
                              {/* Center content */}
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                              {/* Conditionally render SortingButton for the Date column */}
                              {header.column.id === "ChangedAt" &&
                                header.column.getCanSort() && (
                                  <SortingButton column={header.column} />
                                )}
                            </div>
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        className="text-cstm-tertiary"
                        key={row.id + title}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell className="py-2 text-center" key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center text-cstm-tertiary"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </div>
        <div className="flex flex-col items-end justify-center">
          <div className="flex items-center justify-end space-x-2">
            {pagination && (
              <div className="space-x-2">
                <Button
                  size="sm"
                  className="bg-cstm-primary text-cstm-tertiary"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  {generalI18n.previous}
                </Button>
                <Button
                  size="sm"
                  className="bg-cstm-primary text-cstm-tertiary"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  {generalI18n.next}
                </Button>
              </div>
            )}
          </div>
          <p className="mt-2 text-sm text-white">
            Showing {table.getRowModel().rows.length.toLocaleString()} of{" "}
            {table.getRowCount().toLocaleString()} rows.
          </p>
        </div>
      </div>
    </Card>
  );
}
