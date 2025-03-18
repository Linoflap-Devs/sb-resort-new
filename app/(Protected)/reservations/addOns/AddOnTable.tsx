"use client";
import DetailedDataTable from "@/components/DetailedDataTable";
import React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteAddOn, getAddOns } from "@/app/ServerAction/reservations.action";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
  Ellipsis,
} from "lucide-react";
import { useTranslation } from "next-export-i18n";
import { useGlobalStore } from "@/store/useGlobalStore";
import { m } from "framer-motion";
import AlertConfirmDelete from "@/components/AlertConfirmDelete";
import { toast } from "sonner";
import { formatCurrencyJP } from "@/utils/Helpers";
export default function AddOnTable() {
  const { t } = useTranslation();
  const generali18n = t("general");
  const {
    setAddOnModalState,
    setSelectedAddOnData,
    addOnQuery,
    selectedAddOnData,
    addOnFilterType,
    setAddOnFilterType,
  } = useGlobalStore();
  const [deleteModalState, setDeleteModalState] = React.useState(false);
  const { data, refetch } = addOnQuery();

  const mutation = useMutation({
    mutationKey: ["DeleteAddOn"],
    mutationFn: async (value: any) => {
      const res = await deleteAddOn(value);
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "Successfully Deleted an Add-on",
      });
      refetch();
    },
    onError: () => {
      toast.error("Error", {
        description: "There was an error, please try again",
      });
    },
  });

  const column = [
    {
      accessorKey: "Id",
      header: ({ column }: any) => {
        return (
          <div className="flex">
            <Button
              className="flex gap-1 bg-transparent p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Id"}{" "}
              {column.getIsSorted() === "asc" ? (
                <ChevronUpIcon size={12} />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDownIcon size={12} />
              ) : (
                <ChevronsUpDownIcon size={12} strokeWidth={2} />
              )}
            </Button>
          </div>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "AddOnName",
      header: ({ column }: any) => {
        return (
          <div className="flex">
            <Button
              className="flex gap-1 bg-transparent p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Name"}{" "}
              {column.getIsSorted() === "asc" ? (
                <ChevronUpIcon size={12} />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDownIcon size={12} />
              ) : (
                <ChevronsUpDownIcon size={12} strokeWidth={2} />
              )}
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "AddOnType",
      header: ({ column }: any) => {
        return (
          <div className="flex">
            <Button
              className="flex gap-1 bg-transparent p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Type"}{" "}
              {column.getIsSorted() === "asc" ? (
                <ChevronUpIcon size={12} />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDownIcon size={12} />
              ) : (
                <ChevronsUpDownIcon size={12} strokeWidth={2} />
              )}
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "Price",
      header: ({ column }: any) => {
        return (
          <div className="flex justify-end">
            <Button
              className="flex gap-1 bg-transparent p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Price"}{" "}
              {column.getIsSorted() === "asc" ? (
                <ChevronUpIcon size={12} />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDownIcon size={12} />
              ) : (
                <ChevronsUpDownIcon size={12} strokeWidth={2} />
              )}
            </Button>
          </div>
        );
      },
      cell: ({ cell }: any) => {
        return (
          <p className="text-right"> ₱ {formatCurrencyJP(cell.getValue())}</p>
        );
      },
    },
    {
      accessorKey: "AddOnTypeId",
      enableHiding: false,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }: any) => {
        const record = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <Ellipsis className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{generali18n.actions}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setAddOnModalState(true);
                  setSelectedAddOnData(record);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedAddOnData(record);
                  setDeleteModalState(true);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  console.log(addOnFilterType);
  return (
    <div className="p-4">
      <AlertConfirmDelete
        openState={deleteModalState}
        onOpenChange={setDeleteModalState}
        onConfirm={() => mutation.mutate(selectedAddOnData?.Id)}
      />
      <DetailedDataTable
        visibility={{ AddOnTypeId: false }}
        title="Add-ons"
        columns={column}
        pageSize={10}
        columnToSearch={["AddOnName", "AddOnType"]}
        searchPlaceholder="Search Add-ons"
        filterByCol={[
          {
            column: "AddOnType",
            filterValue: addOnFilterType,
          },
        ]}
        data={data}
        initialSort={[{ id: "Id", desc: true }]}
      />
    </div>
  );
}
