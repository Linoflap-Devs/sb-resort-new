"use client";
import { Button } from "@/components/ui/button";
import { useGlobalStore } from "@/store/useGlobalStore";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  Ellipsis,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { useTranslation } from "next-export-i18n";
import DetailedDataTable from "@/components/DetailedDataTable";
import { format, set } from "date-fns";
import DiscountTypeBadge from "@/components/DiscountTypeBadge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { formatCurrencyJP } from "@/utils/Helpers";
import { Switch } from "@/components/ui/switch";
import { useMutation } from "@tanstack/react-query";
import {
  removeDiscount,
  toggleDiscountStatus,
} from "@/app/ServerAction/discounts.action";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import AlertConfirmDelete from "@/components/AlertConfirmDelete";
import { de } from "date-fns/locale";

type DiscountTableProps = {
  role: number;
};
export function DiscountsTable({ role }: DiscountTableProps) {
  const {
    getDiscountsQuery,
    setSelectedDiscountData,
    selectedDiscountData,
    discountFormModalState,
    setDiscountFormModalState,
    setSelectedDiscountRoomType,
    selectedDiscountRoomType,
    getAllDiscountRoomTypeQuery,
  } = useGlobalStore();

  const { t } = useTranslation();
  const generalI18n = t("general");
  const discountI18n = t("Discounts");
  const { data, isLoading, refetch } = getDiscountsQuery();
  const {
    data: roomsDiscount,
    isLoading: roomDiscountLoading,
    refetch: roomDiscountRefetch,
  } = getAllDiscountRoomTypeQuery();
  const [updateLoading, setUpdateLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const toastId = "toast";

  const filterRoomTypes = (id: number) => {
    if (!roomDiscountLoading) {
      return roomsDiscount
        .filter((discount: any) => discount.DiscountId === id)
        .map((discount: any) => discount.RoomTypeId);
    }

    return [];
  };

  const updateDiscount = useMutation({
    mutationFn: async (values: { id: number; state: boolean }) => {
      toast.loading("Updating discount...", {
        id: toastId,
        description: null,
      });
      const data = await toggleDiscountStatus(values.id, values.state);
      if (!data.success) throw new Error();

      return data;
    },
    onSuccess: () => {
      toast.success(generalI18n.success, {
        description: discountI18n.discountUpdateSuccess,
        id: toastId,
      });
      refetch();
      setUpdateLoading(false);
    },
    onError: (error) => {
      toast.error(generalI18n.error, {
        description: discountI18n.discountUpdateFailed,
        id: toastId,
      });
      console.log(error);
      setUpdateLoading(false);
    },
  });

  const deleteDiscountToastId = "deleteDiscountToast";
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      toast.loading("Deleting discount...", {
        id: deleteDiscountToastId,
        description: null,
      });
      const data = await removeDiscount(id);
      if (!data.success) throw new Error();
      return data;
    },
    onSuccess: () => {
      toast.success(generalI18n.success, {
        description: "Discount deleted successfully.",
        id: deleteDiscountToastId,
      });
      refetch();
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "Failed to delete discount.",
        id: deleteDiscountToastId,
      });
      console.log(error);
    },
  });

  const handleToggleDiscount = async (id: number, state: boolean) => {
    setUpdateLoading(true);
    updateDiscount.mutate({ id, state });
  };

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
              {discountI18n.discountId}{" "}
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
      accessorKey: "DiscountName",
      header: ({ column }: any) => {
        return (
          <div className="flex">
            <Button
              className="flex gap-1 bg-transparent p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {discountI18n.discountName}{" "}
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
      accessorKey: "DiscountCode",
      header: ({ column }: any) => {
        return (
          <div className="flex">
            <Button
              className="flex gap-1 bg-transparent p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {discountI18n.discountCode}{" "}
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
        const today = new Date();
        const endDate = row.original.EndDate
          ? new Date(row.original.EndDate)
          : new Date();
        const startDate = row.original.StartDate
          ? new Date(row.original.StartDate)
          : new Date();
        const enabled = row.original.IsActive;
        const usage = row.original.MaxUsage || 1;
        const isExpired =
          endDate < today ||
          startDate > today ||
          enabled == false ||
          usage == 0;
        return (
          <span
            className={`${isExpired ? "bg-red-950" : "bg-green-500"} rounded p-1 px-2 font-semibold`}
          >
            {" "}
            {cell.getValue()}{" "}
          </span>
        );
      },
    },
    {
      accessorKey: "DiscountType",
      id: "DiscountType",
      header: ({ column }: any) => {
        return (
          <div className="flex">
            <Button
              className="flex gap-1 bg-transparent p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {discountI18n.discountType}{" "}
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
        return <DiscountTypeBadge status={cell.getValue()} />;
      },
    },
    {
      accessorKey: "DiscountValue",
      header: ({ column }: any) => {
        return (
          <div className="flex">
            <Button
              className="flex gap-1 bg-transparent p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {discountI18n.discountValue}{" "}
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
        const type = row.original.DiscountType;
        const value =
          type === "flat"
            ? "₱" + cell.getValue().toString()
            : cell.getValue().toString() + "%";
        return value;
      },
    },
    {
      accessorKey: "IsActive",
      header: ({ column }: any) => {
        return (
          <div className="flex">
            <Button
              className="flex gap-1 bg-transparent p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {discountI18n.discountStatus}{" "}
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
        // return (cell.getValue()) ? "Active" : "Inactive"
        const [localState, setLocalState] = useState(cell.getValue());

        return (
          <Switch
            disabled={updateLoading}
            checked={localState}
            onCheckedChange={() => {
              setLocalState(cell.getValue() ? false : true);
              handleToggleDiscount(row.original.Id, !cell.getValue());
            }}
          />
        );
      },
    },
    {
      accessorKey: "StartDate",
      header: ({ column }: any) => {
        return (
          <div className="flex">
            <Button
              className="flex gap-1 bg-transparent p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {discountI18n.startDate}{" "}
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
        if (cell.getValue() === null) return "None";
        const date = new Date(cell.getValue());
        if (!date) return "None";
        return format(date, "MMM dd, yyyy");
      },
    },
    {
      accessorKey: "EndDate",
      header: ({ column }: any) => {
        return (
          <div className="flex">
            <Button
              className="flex gap-1 bg-transparent p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {discountI18n.endDate}{" "}
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
        if (cell.getValue() === null) return "None";
        const date = new Date(cell.getValue());
        if (date < new Date())
          return (
            <span className="text-red-500">{format(date, "MMM dd, yyyy")}</span>
          );
        return format(date, "MMM dd, yyyy");
      },
    },
    {
      accessorKey: "MinNight",
      enableHiding: false,
    },
    {
      accessorKey: "MaxNight",
      enableHiding: false,
    },
    {
      accessorKey: "MinAmount",
      enableHiding: false,
    },
    {
      accessorKey: "MaxAmount",
      enableHiding: false,
    },
    {
      accessorKey: "MaxUsage",
      enableHiding: false,
    },
    {
      id: "Criteria",
      header: "Eligibility",
      cell: ({ row }: any) => {
        const record = row.original;
        return (
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button className="p-0 text-white" variant="link">
                Hover For Details
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <h1 className="text-xl">{record.DiscountName}</h1>
              <div>
                <span
                  className={`${record.IsActive ? "bg-green-500" : "bg-red-500"} rounded p-1 text-white`}
                >
                  {record.IsActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-y-4">
                <div className="flex flex-col">
                  <p className="font-bold">Starting Date</p>
                  <p
                    className={
                      record.StartDate &&
                      (new Date(record.StartDate) > new Date()
                        ? "text-red-500"
                        : "")
                    }
                  >
                    {record.StartDate
                      ? format(new Date(record.StartDate), "MMM dd, yyyy")
                      : "None"}
                  </p>
                </div>
                <div className="flex flex-col">
                  <p className="font-bold">Ending Date</p>
                  <p
                    className={
                      record.EndDate &&
                      (new Date(record.EndDate) < new Date()
                        ? "text-red-500"
                        : "")
                    }
                  >
                    {record.EndDate
                      ? format(new Date(record.EndDate), "MMM dd, yyyy")
                      : "None"}
                  </p>
                </div>
                <div className="flex flex-col">
                  <p className="font-bold">Minimum Stay</p>
                  <p>
                    {record.MinNight > 0 ? `${record.MinNight} nights` : "None"}
                  </p>
                </div>
                <div className="flex flex-col">
                  <p className="font-bold">Maximum Stay</p>
                  <p>
                    {record.MaxNight > 0 ? `${record.MaxNight} nights` : "None"}
                  </p>
                </div>
                <div className="flex flex-col">
                  <p className="font-bold">Minimum Billing</p>
                  <p>
                    {record.MinAmount > 0
                      ? `₱${formatCurrencyJP(record.MinAmount)}`
                      : "None"}
                  </p>
                </div>
                <div className="flex flex-col">
                  <p className="font-bold">Maximum Billing</p>
                  <p>
                    {record.MaxAmount > 0
                      ? `₱${formatCurrencyJP(record.MaxAmount)}`
                      : "None"}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-col">
                <p className="font-bold">Maximum Redemptions</p>
                <p>{record.MaxUsage > 0 ? record.MaxUsage : "None"}</p>
              </div>
            </HoverCardContent>
          </HoverCard>
        );
      },
    },
  ];

  const actionColumn = {
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
                setSelectedDiscountData(record);
                setDiscountFormModalState(true);
                setSelectedDiscountRoomType(filterRoomTypes(record.Id));
                console.log(selectedDiscountRoomType);
                console.log(filterRoomTypes(7));
              }}
            >
              <div className="flex w-full items-center justify-between">
                <p>Edit</p>
                <PencilIcon size={12} color="currentColor" />
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedDiscountData(record);
                setOpen(true);
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
  };
  const columns = [...baseColumns, ...(role !== 1 ? [actionColumn] : [])];

  return (
    <div className="p-4">
      <AlertConfirmDelete
        alertMessage={"Are you sure you want to delete this discount?"}
        openState={open}
        onOpenChange={setOpen}
        onConfirm={() => deleteMutation.mutate(selectedDiscountData.Id)}
      ></AlertConfirmDelete>
      <DetailedDataTable
        isLoading={isLoading}
        title={"Discounts"}
        data={(data as any[]) || []}
        searchPlaceholder={"Search Discounts"}
        columns={columns}
        columnToSearch={[
          "Id",
          "DiscountName",
          "DiscountCode",
          "DiscountType",
          "DiscountValue",
        ]}
        pageSize={10}
        initialSort={[{ id: "Id", desc: true }]}
        visibility={{
          StartDate: false,
          EndDate: false,
          MinNight: false,
          MaxNight: false,
          MinAmount: false,
          MaxAmount: false,
          MaxUsage: false,
        }}
      />
    </div>
  );
}
