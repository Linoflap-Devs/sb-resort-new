"use client";
import DetailedDataTable from "@/components/DetailedDataTable";
import { format, formatDate } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {} from "@/components/ui/dialog";
import { useGlobalStore } from "@/store/useGlobalStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlbumIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
  DoorClosedIcon,
  DoorOpenIcon,
  Ellipsis,
  Loader2,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { deleteReservation } from "@/app/ServerAction/reservations.action";
import { useTranslation } from "next-export-i18n";
import AlertConfirmDelete from "@/components/AlertConfirmDelete";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import ReservationStatusBadge from "@/components/ReservationStatusBadge";
import { channel } from "diagnostics_channel";

export default function ReservationTable() {
  const { t } = useTranslation();
  const router = useRouter();
  const roomsI18n = t("RoomsPage");
  const generali18n = t("general");
  const reservationI18n = t("ReservationsPage");
  const guesti18n = t("GuestPage");
  const locale = t("locale");

  const {
    setSelectedReservationData,
    setReservationFormModalState,
    reservationQuery,
    reservationFilterRoomTypeOpt,
    reservationFilterStatusOpt,
    localeFns,
    billingFormModalState,
    setBillingFormModalState,
  } = useGlobalStore();
  const { data: reservations, isLoading, refetch } = reservationQuery();
  const [deleteModalState, setDeleteModalState] = useState(false);
  const [deleteId, setDeleteId] = useState(0);

  useEffect(() => {
    console.log(reservations);
    console.log(new Date().getDate().toLocaleString("ph-PH"));
    if (reservations) {
      console.log(
        reservations?.filter(
          (reservation: any) =>
            format(new Date(reservation.CreatedAt), "MM-dd-yyyy") ==
            format(new Date(), "MM-dd-yyyy"),
        ),
      );
      console.log(format(new Date(), "MM-dd-yyyy"));
      console.log(format(new Date(reservations[0]?.CreatedAt), "MM-dd-yyyy"));
    }
  }, [isLoading]);

  const mutation = useMutation({
    mutationKey: ["DeleteReservation"],
    mutationFn: async (id: number) => {
      const res = await deleteReservation(id);
      if (!res.success) throw new Error();
    },
    onSuccess: () => {
      console.log(generali18n);
      toast.success(generali18n.success, {
        description: reservationI18n.toast.deleteReservation,
      });
      setDeleteModalState(false);
      refetch();
    },
    onError: () => {
      toast.error(generali18n.failed, {
        description: generali18n.somethingWentWrong,
      });
    },
  });

  const columns: ColumnDef<any>[] = [
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
      cell: ({ cell }: any) => {
        return <div className="">{cell.getValue()}</div>;
      },
      filterFn: "includesString",
    },
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
      accessorKey: "GuestData",
      header: () => {
        return <div className="">{guesti18n.guestName}</div>;
      },
      cell: ({ cell }: any) => {
        const cellData = cell.getValue();
        return (
          <div className="">
            {cellData
              ? `${cellData.FirstName} 
                    ${cellData.LastName} `
              : "N/A"}
          </div>
        );
      },
    },
    // {
    //   accessorKey: "GuestData",
    //   header: guesti18n.guestPhone,
    //   cell: ({cell}: any) => {
    //     const cellData = cell.getValue();
    //     return cellData ? `${cellData.Contact}` : "N/A"
    //   }
    // },
    // {
    //   accessorKey: "GuestData",
    //   header: guesti18n.guestEmail,
    //   cell: ({cell}: any) => {
    //     const cellData = cell.getValue();
    //     return cellData ? `${cellData.Email}` : "N/A"
    //   }
    // },
    // {
    //   accessorFn: (row: any) => row.GuestData?.FirstName,
    //   id: "GuestFName",
    //   header: generali18n.firstname,
    //   cell: ({ cell }: any) => {
    //     return cell.getValue() ? `${cell.getValue()}` : "N/A"
    //   }
    // },
    // {
    //   accessorFn: (row: any) => row.GuestData?.LastName,
    //   id: "GuestLName",
    //   header: generali18n.lastname,
    //   cell: ({ cell }: any) => {
    //     return cell.getValue() ? `${cell.getValue()}` : "N/A"
    //   }
    // },
    // {
    //   accessorFn: (row: any) => row.GuestData?.Email,
    //   id: "GuestEmail",
    //   header: generali18n.email,
    //   cell: ({ cell }: any) => {
    //     return cell.getValue() ? `${cell.getValue()}` : "N/A"
    //   }
    // },
    // {
    //   accessorFn: (row: any) => row.GuestData?.Contact,
    //   id: "GuestPhone",
    //   header: generali18n.contactNumber,
    //   cell: ({ cell }: any) => {
    //     return cell.getValue() ? `${cell.getValue()}` : "N/A"
    //   }
    // },
    {
      id: "CreatedAt",
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
              Booking Date{" "}
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
          <div className="">
            {format(new Date(cell.getValue()), "MMM dd, yyyy")}
          </div>
        );
      },
      sortingFn: "datetime",
    },
    {
      id: "checkInDate",
      accessorKey: "CheckInDate",
      header: ({ column }: any) => {
        return (
          <div className="flex">
            <Button
              className="flex gap-1 bg-transparent p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {reservationI18n.checkInDate}{" "}
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
          <div className="">
            {format(new Date(cell.getValue()), "MMM dd, yyyy")}
          </div>
        );
      },
      sortingFn: "datetime",
    },
    {
      id: "checkOutDate",
      accessorKey: "CheckOutDate",
      header: ({ column }: any) => {
        return (
          <div className="flex">
            <Button
              className="flex gap-1 bg-transparent p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {reservationI18n.checkOutDate}{" "}
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
          <div className="">
            {format(new Date(cell.getValue()), "MMM dd, yyyy")}
          </div>
        );
      },
      sortingFn: "datetime",
    },
    // {
    //   accessorKey: "CheckTime",
    //   header: () => {
    //     return (
    //       <div className="flex h-min flex-col justify-center gap-1">
    //         <p className="rounded-lg text-center text-xs font-semibold">
    //           {reservationI18n.checkInDate}
    //         </p>
    //         <p className="rounded-lg text-center text-xs font-semibold">
    //           {reservationI18n.checkOutDate}
    //         </p>
    //       </div>
    //     );
    //   },
    //   cell: ({ row }: any) => {
    //     return (
    //       <div className="flex h-min flex-col justify-center gap-1">
    //         <p className="rounded-lg bg-green-500 text-center text-xs font-semibold">
    //           {format(new Date(row.getValue("CheckInDate")), "MMM dd, yyyy", {
    //             locale: localeFns[locale],
    //           })}
    //         </p>
    //         <p className="rounded-lg bg-red-500 text-center text-xs font-semibold">
    //           {format(new Date(row.getValue("CheckOutDate")), "MMM dd, yyyy", {
    //             locale: localeFns[locale],
    //           })}
    //         </p>
    //       </div>
    //     );
    //   },
    // },
    // {
    //   accessorKey: "RoomCount",
    //   header: () => {
    //     return <div className="text-center">{reservationI18n.roomCount}</div>;
    //   },
    //   cell: ({ cell }: any) => {
    //     return <p className="text-center">{cell.getValue()}</p>;
    //   },
    // },
    {
      accessorKey: "RoomType",
      header: ({ column }: any) => {
        return (
          <div className="flex">
            <Button
              className="flex gap-1 bg-transparent p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {roomsI18n.roomType}{" "}
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
      cell: ({ cell, row }: any) => {
        const status = cell.getValue() as string;
        return (
          <div className="flex h-min">
            <ReservationStatusBadge status={status} />
          </div>
        );
      },
    },
    // {
    //   accessorKey: "ReservationType",
    //   header: ({column}: any) => {
    //     return (
    //       <div className="flex justify-center">
    //         <Button
    //           className="p-0 bg-transparent font-semibold"
    //           onClick={() => {
    //             column.toggleSorting(column.getIsSorted() === 'asc')
    //             console.log(column.getIsSorted())
    //           }}
    //         >
    //           {reservationI18n.reservationType} {!(column.getIsSorted == false) && column.getIsSorted() == 'asc' ? "▴" : "▾"}
    //         </Button>
    //       </div>
    //     )
    //   },
    //   cell: ({ cell }: any) => {
    //     return <div className="flex h-min justify-center">{reservationI18n.type[cell.getValue()]}</div>;
    //   },
    // },

    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }: any) => {
        const record = row.original;
        const isPending = row.getValue("ReservationStatus") === "Pending";
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
                  setSelectedReservationData(record);
                  router.push(`/reservations/details/${record.Id}`);
                }}
              >
                View Details
              </DropdownMenuItem>
              {isPending ? (
                <>
                  <DropdownMenuItem
                    disabled={!isPending}
                    onClick={() => {
                      console.log(record);
                      setSelectedReservationData(record);
                      setReservationFormModalState(true);
                    }}
                  >
                    {generali18n.edit}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={!isPending}
                    onClick={() => {
                      setSelectedReservationData(record);
                      setBillingFormModalState(true);
                    }}
                  >
                    Bill Out
                  </DropdownMenuItem>
                </>
              ) : null}
              <DropdownMenuItem
                onClick={() => {
                  setDeleteModalState(true);
                  setDeleteId(record.Id);
                }}
                className="font-medium text-red-500"
              >
                {generali18n.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="p-4">
      <AlertConfirmDelete
        openState={deleteModalState}
        onOpenChange={setDeleteModalState}
        onConfirm={() => {
          mutation.mutate(deleteId);
        }}
      />
      <div className="mb-4 flex gap-4">
        <div className="flex w-1/3 justify-between rounded bg-cstm-secondary p-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-white/[.60]">
              NEW BOOKINGS
            </p>
            <p className="text-3xl font-bold text-white">
              {isLoading ? (
                <Loader2 className="animate-spin" color="white" />
              ) : (
                reservations?.filter(
                  (reservation: any) =>
                    format(new Date(reservation.CreatedAt), "MM-dd-yyyy") ==
                      format(new Date(), "MM-dd-yyyy") &&
                    reservation.ReservationStatus == "Pending",
                ).length
              )}
            </p>
          </div>
          <div className="flex aspect-square w-auto items-center justify-center rounded-full bg-white/[.10] p-2 text-white">
            <AlbumIcon color="currentColor" size={36} />
          </div>
        </div>
        <div className="flex w-1/3 justify-between rounded bg-cstm-secondary p-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-white/[.60]">
              EXPECTED CHECK-INS
            </p>
            <p className="text-3xl font-bold text-white">
              {isLoading ? (
                <Loader2 className="animate-spin" color="white" />
              ) : (
                reservations?.filter(
                  (reservation: any) =>
                    format(new Date(reservation.CheckInDate), "MM-dd-yyyy") ==
                      format(new Date(), "MM-dd-yyyy") &&
                    reservation.ReservationStatus == "Pending",
                ).length
              )}
            </p>
          </div>
          <div className="flex aspect-square w-auto items-center justify-center rounded-full bg-white/[.10] p-2 text-white">
            <DoorClosedIcon color="currentColor" size={36} />
          </div>
        </div>
        <div className="flex w-1/3 justify-between rounded bg-cstm-secondary p-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-white/[.60]">
              EXPECTED CHECK-OUTS
            </p>
            <p className="text-3xl font-bold text-white">
              {isLoading ? (
                <Loader2 className="animate-spin" color="white" />
              ) : (
                reservations?.filter(
                  (reservation: any) =>
                    format(new Date(reservation.CheckOutDate), "MM-dd-yyyy") ==
                      format(new Date(), "MM-dd-yyyy") &&
                    reservation.ReservationStatus == "Checked-In",
                ).length
              )}
            </p>
          </div>
          <div className="flex aspect-square w-auto items-center justify-center rounded-full bg-white/[.10] p-2 text-white">
            <DoorOpenIcon color="currentColor" size={36} />
          </div>
        </div>
      </div>
      <DetailedDataTable
        title={reservationI18n.reservations}
        columns={columns}
        isLoading={isLoading}
        // data={reservations || []}
        data={
          reservations && reservations.length > 0
            ? reservations.filter((reservation: any) =>
                reservationFilterRoomTypeOpt
                  ? reservation.RoomType.toLowerCase() ===
                    reservationFilterRoomTypeOpt.toLowerCase()
                  : true,
              )
            : []
        }
        pageSize={10}
        columnToSearch={[
          "Id",
          "ReservationStatus",
          "ReservationType",
          "GuestFName",
          "GuestLName",
          "CheckInDate",
          "CheckOutDate",
          "RoomType",
        ]}
        searchPlaceholder={reservationI18n.searchReservation}
        filterByCol={[
          {
            column: "ReservationStatus",
            filterValue: reservationFilterStatusOpt,
          },
        ]}
        visibility={{
          firstName: false,
          lastName: false,
          checkInDate: true,
          checkOutDate: true,
        }}
      />
    </div>
  );
}
