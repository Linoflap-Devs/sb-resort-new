"use client";
import AlertConfirmDelete from "@/components/AlertConfirmDelete";
import DetailedDataTable from "@/components/DetailedDataTable";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGlobalStore } from "@/store/useGlobalStore";
import { format } from "date-fns";
import {
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
  Ellipsis,
} from "lucide-react";
import { useTranslation } from "next-export-i18n";
import { useState } from "react";
import { togglePromoStatus } from "@/app/ServerAction/promos.action";
import { Switch } from "@/components/ui/switch";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

type PromosTableProps = {
  role: number;
};

export default function PromosTable({ role }: PromosTableProps) {
  const { t } = useTranslation();
  const generalI18n = t("general");
  const {
    promosFormModalState,
    setPromosFormModalState,
    setSelectedPromoData,
    selectedPromoData,
    promosQuery,
    selectedRoomTypePromosFilter,
  } = useGlobalStore();
  const { refetch } = promosQuery();
  const [openDelete, setOpenDelete] = useState(false);
  let selectedPromoId = 0;

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ promoId, newStatus }: { promoId: number; newStatus: boolean }) => {
      return await togglePromoStatus(promoId, newStatus);
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "Promo status has been updated successfully",
      });
      refetch();
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || "Could not update promo status",
      });
    },
  });

  const { data, isLoading } = promosQuery();
  ;

  const baseColumns = [
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
              {"Promo ID"}{" "}
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
      accessorKey: "PromoDetailId",
      enableHiding: false,
    },
    {
      accessorKey: "PromoName",
      header: ({ column }: any) => {
        return (
          <div className="flex">
            <Button
              className="flex gap-1 bg-transparent p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Promo Name"}{" "}
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
      accessorKey: "PromoCode",
      header: "Promo Code",
    },
    {
      accessorKey: "Rates",
      header: "Rates",
      cell: ({ row }: any) => {
        const record = row.original;
        return (
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button className="p-0 text-white" variant="link">
                Hover For Rates
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <h1 className="text-center text-xl">Promo Rates</h1>
              <div className="px-5">
                <div className="flex justify-between">
                  <h1>Base Room Rate: </h1>
                  <p>₱ {record.BaseRoomRate}</p>
                </div>
                <div className="flex justify-between">
                  <h1>Extra Adult Rate</h1>
                  <p>₱ {record.ExtraAdultRate}</p>
                </div>
                <div className="flex justify-between">
                  <h1>Extra Child Rate</h1>
                  <p>₱ {record.ExtraChildRate}</p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        );
      },
    },
    {
      accessorKey: "ExtraChildRate",
      enableHiding: false,
    },
    {
      accessorKey: "ExtraAdultRate",
      enableHiding: false,
    },
    {
      accessorKey: "BaseRoomRate",
      enableHiding: false,
    },
    {
      accessorKey: "RoomType",
      header: "Room Type",
    },
    {
      accessorKey: "RoomTypeId",
      enableHiding: false,
    },
    {
      accessorKey: "RedemptionLeft",
      header: "Redemption Left",
    },
    {
      accessorKey: "ExpiredAt",
      header: "Expired At",
      cell: ({ row, cell }: any) => {
        const date = new Date(cell.getValue() || 0);
        if (date < new Date())
          return (
            <span className="text-red-500">{format(date, "MMM yyyy")}</span>
          );
        return format(date, "MMM yyyy");
      },
    },
    {
      accessorKey: "CreatedAt",
      header: ({ column }: any) => {
        return (
          <div className="flex">
            <Button
              className="flex gap-1 bg-transparent p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Date Created"}{" "}
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
      cell: ({ row, cell }: any) => {
        const date = new Date(cell.getValue() || 0);
        return format(date, "MMM dd, yyyy");
      },
    },
    {
      id: "Status",
      header: "Status",
      cell: ({ row }: any) => {
        const IsActive = row.original.IsActive;

        const handleToggleStatus = () => {
          toggleStatusMutation.mutate({
            promoId: row.original.PromoDetailId,
            newStatus: !IsActive,
          });
        };

        return <Switch checked={IsActive} onCheckedChange={handleToggleStatus} />;
      },
    }
  ];

  const actionsColumn = {
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
            <DropdownMenuLabel>{generalI18n.actions}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setPromosFormModalState(true);
                setSelectedPromoData(record);
              }}
            >
              {generalI18n.edit}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                selectedPromoId = record.Id;
                setOpenDelete(true);
              }}
              className="font-medium text-red-500"
            >
              {generalI18n.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  };

  // Only add the actions column if role is not equal to 1
  const columns = [...baseColumns, ...(role !== 1 ? [actionsColumn] : [])];

  return (
    <div className="p-4">
      <AlertConfirmDelete
        openState={openDelete}
        onOpenChange={setOpenDelete}
        onConfirm={() => { }}
      />
      <DetailedDataTable
        title="Promos"
        isLoading={isLoading}
        columns={columns}
        data={data}
        pageSize={7}
        searchPlaceholder="Search Promo Name"
        columnToSearch={[
          "Id",
          "PromoName",
          "PromoCode",
          "RoomType",
          "CreatedAt",
          "ExpiredAt",
        ]}
        filterByCol={[
          {
            column: "RoomTypeId",
            filterValue: selectedRoomTypePromosFilter,
          },
        ]}
        visibility={{
          RoomTypeId: false,
          PromoDetailId: false,
          ExtraChildRate: false,
          ExtraAdultRate: false,
          BaseRoomRate: false,
        }}
      />
    </div>
  );
}
