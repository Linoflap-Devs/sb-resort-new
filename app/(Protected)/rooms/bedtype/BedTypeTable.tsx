"use client";

import { deleteBedType } from "@/app/ServerAction/rooms.action";
import DetailedDataTable from "@/components/DetailedDataTable";
import { Button } from "@/components/ui/button";
import { useGlobalStore } from "@/store/useGlobalStore";
import { useMutation } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
  Ellipsis,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { useTranslation } from "next-export-i18n";
import React, { useState } from "react";
import { toast } from "sonner";
import AlertConfirmDelete from "@/components/AlertConfirmDelete";

export default function BedTypesTable() {
  const { t } = useTranslation();
  const generalI18n = t("general");
  const roomsI18n = t("RoomsPage");
  const locale = t("locale");

  const {
    selectedBedTypeFilter,
    bedTypeQuery,
    setBedTypeFormModalState,
    setSelectedBedType,
  } = useGlobalStore();

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const { data: bedTypes, isLoading, refetch } = bedTypeQuery();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log(id);
      const res = await deleteBedType(id);
      if (!res.success) {
        console.log(res.error);
        throw new Error(res.error);
      }
      return;
    },
    onSuccess: () => {
      toast.success(roomsI18n.toast.success, {
        description: roomsI18n.toast.deleteRateSuccess,
      });
      refetch();
    },
    onError: () => {
      toast.error(roomsI18n.toast.error, {
        description: roomsI18n.toast.failed,
      });
    },
  });

  const bedTypeColumns = [
    {
      accessorKey: "TypeName",
      header: ({ column }: any) => {
        return (
          <div className="flex">
            <Button
              className="flex gap-1 bg-transparent p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Bed Type"}{" "}
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
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedBedType(record);
                  setBedTypeFormModalState(true);
                }}
              >
                <div className="flex w-full items-center justify-between">
                  <p>Edit</p>
                  <PencilIcon size={12} color="currentColor" />
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setOpen(true);
                  setSelectedId(row.getValue("Id").toString());
                  setSelectedBedType(record);
                }}
                className="font-medium text-red-500"
              >
                <div className="flex w-full items-center justify-between">
                  <p>Delete</p>
                  <TrashIcon size={12} color="currentColor" />
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div>
      <AlertConfirmDelete
        openState={open}
        onOpenChange={setOpen}
        onConfirm={() => {
          console.log("trigger");
          deleteMutation.mutate(selectedId);
        }}
      />
      <DetailedDataTable
        isLoading={isLoading}
        title={"Bed Types"}
        data={(bedTypes as any[]) || []}
        searchPlaceholder={"Search Bed Types"}
        columns={bedTypeColumns}
        columnToSearch={["Id", "TypeName"]}
        pageSize={5}
        filterByCol={[
          {
            column: "TypeName",
            filterValue: selectedBedTypeFilter,
          },
        ]}
      ></DetailedDataTable>
    </div>
  );
}
