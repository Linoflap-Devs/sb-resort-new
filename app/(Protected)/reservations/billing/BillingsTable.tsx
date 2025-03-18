"use client";
import {
  getBillings,
  getReservationSummary,
} from "@/app/ServerAction/reservations.action";
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
import { useQuery } from "@tanstack/react-query";
import { format, formatDate } from "date-fns";
import { Cell } from "recharts";
import { useTranslation } from "next-export-i18n";
import {
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
  Ellipsis,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useGlobalStore } from "@/store/useGlobalStore";
import { ColumnDef } from "@tanstack/react-table";
import { commafy, formatCurrencyJP } from "@/utils/Helpers";
import { ReservationSummaryRecord } from "@/types";
import ReservationStatusBadge from "@/components/ReservationStatusBadge";
import { access } from "fs";
import { useRouter } from "next/navigation";
export default function BillingsTable() {
  const { t } = useTranslation();
  const { locale } = t("locale");
  const reservationI18n = t("ReservationsPage");
  const generali18n = t("general");
  const roomsI18n = t("RoomsPage");

  const router = useRouter();

  const {
    localeFns,
    setBillingAddOnFormModalState,
    setSelectedBillingData,
    selectedBillingData,
    billingsQuery,
    setFinilizeBillingModalState,
    selectedBillingStatusFilter,
    selectedBillingReservationStatusFilter,
    resetSelectOptState,
    reservationSummaryQuery,
  } = useGlobalStore();

  const { data: billings } = billingsQuery();

  const { data, isLoading, error } = reservationSummaryQuery();

  console.log(selectedBillingData);

  const column = [
    {
      accessorKey: "Id",
      enableHiding: false,
    },
    {
      accessorKey: "ReservationId",
      header: ({ column }: any) => {
        return (
          <div className="flex">
            <Button
              className="flex gap-1 bg-transparent p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {reservationI18n.reservationId}{" "}
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
      filterFn: "includesString",
    },
    {
      header: reservationI18n.guestName,
      cell: ({ row }: any) => {
        const firstName = row.getValue("FirstName");
        const lastName = row.getValue("LastName");
        const guest = firstName + " " + lastName;
        return firstName ? guest : "N/A";
      },
    },
    {
      accessorKey: "RoomNumber",
      header: roomsI18n.roomNumber,
    },
    {
      accessorKey: "CheckInDate",
      header: ({ column }: any) => {
        return "Check-In Date";
      },
      cell: ({ row }: any) => {
        const date = format(
          new Date(row.getValue("CheckInDate")),
          "MMM dd, yyyy",
        );
        return date;
      },
    },
    {
      accessorKey: "CheckOutDate",
      header: ({ column }: any) => {
        return "Check-Out Date";
      },
      cell: ({ row }: any) => {
        const date = format(
          new Date(row.getValue("CheckOutDate")),
          "MMM dd, yyyy",
        );
        return date;
      },
    },
    {
      accessorKey: "BillingStatus",
      header: ({ column }: any) => {
        return (
          <div className="flex">
            <Button
              className="flex gap-1 bg-transparent p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {reservationI18n.billingStatus}{" "}
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
          <span
            className={`rounded-full px-2 py-1 ${
              cell.getValue() === "Deposit Paid"
                ? "bg-orange-600"
                : cell.getValue() === "Unpaid"
                  ? "bg-red-500"
                  : "bg-green-500"
            }`}
          >
            {cell.getValue()}
          </span>
        );
      },
    },

    // {
    //   accessorKey: "BillingStatus",
    //   header: ({ column }: any) => (
    //     <div className="flex">
    //       <Button
    //         className="flex gap-1 bg-transparent p-0 font-semibold"
    //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //       >
    //         {reservationI18n.billingStatus}{" "}
    //         {column.getIsSorted() === "asc" ? (
    //           <ChevronUpIcon size={12} />
    //         ) : column.getIsSorted() === "desc" ? (
    //           <ChevronDownIcon size={12} />
    //         ) : (
    //           <ChevronsUpDownIcon size={12} strokeWidth={2} />
    //         )}
    //       </Button>
    //     </div>
    //   ),
    //   cell: ({ cell, row }: any) => {
    //     // Assuming the deposit amount is available in the record.
    //     const deposit = row.original.Deposit;
    //     const status =
    //       !deposit ||
    //       (deposit === 0 && row.original.ReservationStatus !== "done")
    //         ? "Unpaid"
    //         : cell.getValue();
    //     // You can also change the badge class based on the status.
    //     const badgeClass =
    //       status === "Deposit Paid"
    //         ? "bg-orange-600"
    //         : status === "Unpaid"
    //           ? "bg-red-500"
    //           : "bg-green-500";
    //     return (
    //       <span className={`rounded-full px-2 py-1 ${badgeClass}`}>
    //         {status}
    //       </span>
    //     );
    //   },
    // },

    // {
    //   accessorKey: "InitialBill",
    //   header: reservationI18n.initialBill,
    //   cell: ({ cell }: any) => {
    //     return `₱ ${commafy(cell.getValue())}`;
    //   },
    // },
    // {
    //   accessorKey: "TotalPerAddOn",
    //   header: reservationI18n.totalAddOnPrice,
    //   cell: ({ cell }: any) => {
    //     return `₱ ${commafy(cell.getValue())}`;
    //   },
    // },
    {
      accessorKey: "ReservationStatus",
      header: ({ column }: any) => {
        return (
          <div className="flex">
            <Button
              className="flex gap-1 bg-transparent p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {reservationI18n.reservationStatus}{" "}
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
      // cell: ({ cell }: any) => {
      //   return <p className="text-right">{`₱ ${formatCurrencyJP(cell.getValue())}`}</p>;
      // },
      cell: ({ cell, row }: any) => {
        const status = cell.getValue() as string;
        return (
          <div className="flex h-min">
            <ReservationStatusBadge status={status} />
          </div>
        );
      },
    },

    {
      accessorKey: "FirstName",
      enableHiding: false,
    },
    ,
    {
      accessorKey: "LastName",
      enableHiding: false,
    },
    // ,
    // {
    //   accessorKey: "CreatedAt",
    //   header: generali18n.createdAt,
    //   cell: ({ cell }: any) => {
    //     return format(new Date(cell.getValue()), "MMM dd, yyyy", {
    //       locale: localeFns[locale],
    //     });
    //   },
    // },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }: any) => {
        const record = row.original;
        const isFinalized =
          record.BillingStatus === "Fully Paid" &&
          record.ReservationStatus === "Done";
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
                  router.push(`/reservations/details/${record.ReservationId}`);
                  // /reservations/details/[number]
                }}
              >
                {reservationI18n.viewReservationDetail}
              </DropdownMenuItem>
              {!isFinalized && (
                <>
                  <DropdownMenuItem
                    disabled={isFinalized}
                    onClick={() => {
                      setSelectedBillingData(record);
                      setBillingAddOnFormModalState(true);
                    }}
                  >
                    {reservationI18n.addAddOn}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedBillingData(record);
                      setFinilizeBillingModalState(true);
                    }}
                    disabled={isFinalized}
                  >
                    {reservationI18n.finalizeBill}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  return (
    <>
      <div className="p-4">
        <DetailedDataTable
          title={reservationI18n.billings}
          isLoading={isLoading}
          columns={column as ColumnDef<any>[]}
          // data={data || []}
          data={
            data && data.length > 0
              ? data.filter(
                  (billing: any) =>
                    selectedBillingStatusFilter
                      ? billing.BillingStatus.toLowerCase() ===
                        selectedBillingStatusFilter.toLowerCase()
                      : true, // Show all if no filter is applied
                )
              : []
          } // Ensure an empty array if no data
          visibility={{ Id: false, FirstName: false, LastName: false }}
          columnToSearch={[
            "ReservationId",
            "FirstName",
            "LastName",
            "RoomNumber",
            "CheckInDate",
            "CheckOutDate",
          ]}
          initialSort={[{ id: "ReservationId", desc: true }]}
          filterByCol={[
            {
              column: "ReservationStatus",
              filterValue: selectedBillingReservationStatusFilter,
            },
          ]}
        />
      </div>
    </>
  );
}
