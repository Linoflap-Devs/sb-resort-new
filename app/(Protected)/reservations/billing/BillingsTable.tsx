"use client";
import { getBillings, getReservationSummary } from "@/app/ServerAction/reservations.action";
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
import { format } from "date-fns";
import { Cell } from "recharts";
import { useTranslation } from "next-export-i18n";
import { ChevronDownIcon, ChevronsUpDownIcon, ChevronUpIcon, Ellipsis } from "lucide-react";
import { useEffect, useState } from "react";
import { useGlobalStore } from "@/store/useGlobalStore";
import { ColumnDef } from "@tanstack/react-table";
import { commafy, formatCurrencyJP } from "@/utils/Helpers";
import { ReservationSummaryRecord } from "@/types";
import ReservationStatusBadge from "@/components/ReservationStatusBadge";
export default function BillingsTable() {
  const { t } = useTranslation();
  const { locale } = t("locale");
  const reservationI18n = t("ReservationsPage");
  const generali18n = t("general");
  const roomsI18n = t("RoomsPage");

  const {
    localeFns,
    setBillingAddOnFormModalState,
    setSelectedBillingData,
    selectedBillingData,
    billingsQuery,
    setFinilizeBillingModalState,
    selectedBillingStatusFilter,
    resetSelectOptState,
    reservationSummaryQuery
  } = useGlobalStore();

  const { data: billings } = billingsQuery();

  const {data, isLoading, error } = reservationSummaryQuery()

  console.log(selectedBillingData)

  const column = [
    {
      
      accessorKey: "Id",
      enableHiding: false,
    },
    {

      accessorKey: "ReservationId",
      header: ({column}: any) => {
        return (
          <div className="flex">
            <Button 
              className="p-0 bg-transparent font-semibold flex gap-1"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              {reservationI18n.reservationId} {
                column.getIsSorted() === 'asc' ? 
                <ChevronUpIcon size={12} /> : 
                column.getIsSorted() === 'desc' ? <ChevronDownIcon size={12} /> : 
                <ChevronsUpDownIcon size={12} strokeWidth={2} />
              }
            </Button>
          </div>
        )
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
      accessorKey: "BillingStatus",
      header: ({column}: any) => {
        return (
          <div className="flex">
            <Button 
              className="p-0 bg-transparent font-semibold flex gap-1"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              {reservationI18n.billingStatus} {
                column.getIsSorted() === 'asc' ? 
                <ChevronUpIcon size={12} /> : 
                column.getIsSorted() === 'desc' ? <ChevronDownIcon size={12} /> : 
                <ChevronsUpDownIcon size={12} strokeWidth={2} />
              }
            </Button>
          </div>
        )
      },
      cell: ({ cell }: any) => {
        return <span className={`rounded-full py-1 px-2 ${cell.getValue() == "Deposit Paid" ? 'bg-orange-600' : 'bg-green-500'}`}>{cell.getValue()}</span>;
      },
    },
    
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
      header: ({column}: any) => {
        return (
          <div className="flex">
            <Button 
              className="p-0 bg-transparent font-semibold flex gap-1"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              {reservationI18n.reservationStatus} {
                column.getIsSorted() === 'asc' ? 
                <ChevronUpIcon size={12} /> : 
                column.getIsSorted() === 'desc' ? <ChevronDownIcon size={12} /> : 
                <ChevronsUpDownIcon size={12} strokeWidth={2} />
              }
            </Button>
          </div>
        )
      },
      // cell: ({ cell }: any) => {
      //   return <p className="text-right">{`₱ ${formatCurrencyJP(cell.getValue())}`}</p>;
      // },
      cell: ({ cell, row }: any) => {
        const status = cell.getValue() as string;
        return (
          <div className="flex h-min ">
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
        const isFinalized = record.BillingStatus === "Fully Paid";
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
                  setSelectedBillingData(record);
                  setFinilizeBillingModalState(true);
                }}
                disabled={isFinalized}
              >
                {reservationI18n.finalizeBill}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isFinalized}
                onClick={() => {
                  setSelectedBillingData(record);
                  setBillingAddOnFormModalState(true);
                }}
              >
                {reservationI18n.addAddOn}
              </DropdownMenuItem>
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
          data={data || []}
          visibility={{ Id: false, FirstName: false, LastName: false }}
          columnToSearch={["ReservationId", "FirstName", "LastName"]}
          initialSort={[{id: "ReservationId", desc: true}]}
        />
      </div>
    </>
  );
}
