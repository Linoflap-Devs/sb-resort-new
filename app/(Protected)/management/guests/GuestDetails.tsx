"use client";
import React from "react";
import DetailedDataTable from "@/components/DetailedDataTable";
import { SimpleDataTable } from "@/components/SimpleDataTable";
import { Card, CardHeader } from "@/components/ui/card";
import { useTranslation } from "next-export-i18n";
import { useQuery } from "@tanstack/react-query";
import { getGuestDetails } from "@/app/ServerAction/manage.action";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Phone, MapPin } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface Reservation {
  Id: string;
  GuestId: string;
  RoomType: string;
  CheckInDate: string;
  CheckOutDate: string;
  [key: string]: any; // For any other fields
}

interface RoomAssignment {
  RoomNumber: string;
  ReservationId: string;
  GuestId: string;
}

export default function GuestDetails({ id }: { id: string }) {
  const { t } = useTranslation();
  const cardHeaderClass =
    "flex rounded-t-md bg-cstm-primary p-1 pl-4 text-xl font-semibold text-white";

  const { isLoading, data: guest } = useQuery({
    queryKey: ["GetGuestsDetails"],
    queryFn: async () => {
      const res = await getGuestDetails(id);
      if (!res.success) {
        throw new Error();
      }
      console.log(res);
      return res.res;
    },
  });

  // Create properly merged reservation data with room numbers
  const mergedReservationData = React.useMemo(() => {
    if (!guest || !guest[1] || !guest[2]) return [];

    const reservations = guest[1] as Reservation[];
    const roomAssignments = guest[2] as RoomAssignment[];

    // Map room assignments to their corresponding reservations
    return reservations.map((reservation: Reservation) => {
      // Find matching room assignment (if any)
      const matchingRoom = roomAssignments.find(
        (room: RoomAssignment) => room.ReservationId === reservation.Id,
      );

      return {
        ...reservation,
        RoomNumber: matchingRoom ? matchingRoom.RoomNumber : "Unassigned",
      };
    });
  }, [guest]);

  const columns = [
    {
      accessorKey: "Id",
      header: "Reservation ID",
    },
    {
      accessorKey: "RoomType",
      header: "Room Type",
    },
    {
      accessorKey: "RoomNumber",
      header: "Room Number",
    },
    {
      accessorKey: "CheckInDate",
      header: "Check-in",
    },
    {
      accessorKey: "CheckOutDate",
      header: "Check-out",
    },
  ];

  return (
    <div className="flex gap-4 p-4">
      <div className="flex w-2/5 flex-col gap-4">
        <Card>
          <CardHeader className={cardHeaderClass}>Guest Details</CardHeader>
          {isLoading ? (
            <Skeleton className="h-52 w-full" />
          ) : (
            <div className="flex flex-col gap-4 p-4">
              <>
                <div className="flex gap-4 border-b pb-2">
                  <div className="flex items-center gap-4 text-black/[.50]">
                    <User color="currentColor" size={48} />
                  </div>
                  <div className="grow-1 flex flex-col justify-center">
                    <p className="text-xl font-semibold text-black/[.70]">{`${guest?.[0]?.FirstName || "Anonymous"} ${guest?.[0]?.LastName || "Guest"}`}</p>
                    <p className="text-sm text-black/[.70]">
                      {format(new Date(guest?.[0]?.BirthDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="flex w-full gap-4">
                  <div className="flex w-1/2 gap-4">
                    <div className="flex items-center gap-4 text-black/[.50]">
                      <Mail color="currentColor" size={20} />
                    </div>
                    <div className="grow-1 flex flex-col">
                      <p className="text-sm text-black/[.50]">Email</p>
                      <p className="font-semibold text-black/[.70]">
                        {guest?.[0]?.Email || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex w-1/2 gap-4">
                    <div className="flex items-center gap-4 text-black/[.50]">
                      <Phone color="currentColor" size={20} />
                    </div>
                    <div className="grow-1 flex flex-col">
                      <p className="text-sm text-black/[.50]">Phone Number</p>
                      <p className="font-semibold text-black/[.70]">
                        {guest?.[0]?.Contact || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex w-full gap-4">
                  <div className="flex w-1/2 gap-4">
                    <div className="flex items-center gap-4 text-black/[.50]">
                      <MapPin color="currentColor" size={20} />
                    </div>
                    <div className="grow-1 flex flex-col">
                      <p className="text-sm text-black/[.50]">Address</p>
                      <p className="font-semibold text-black/[.70]">
                        {guest?.[0]?.Address1 || "N/A"}
                      </p>
                      {guest?.[0]?.Address2 && (
                        <p className="font-semibold text-black/[.70]">
                          {guest?.[0]?.Address2}
                        </p>
                      )}
                      <p className="font-semibold text-black/[.70]">
                        {guest?.[0]?.City || "N/A"},{" "}
                        {guest?.[0]?.ZIPCode || "N/A"}
                      </p>
                      <p className="font-semibold text-black/[.70]">
                        {guest?.[0]?.Country || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            </div>
          )}
        </Card>
      </div>
      <div className="w-3/5">
        <DetailedDataTable
          title="Guest Reservation History"
          columns={columns}
          columnToSearch={["Id", "CheckInDate", "CheckOutDate", "RoomType"]}
          isLoading={isLoading}
          data={mergedReservationData}
        />
      </div>
    </div>
  );
}
