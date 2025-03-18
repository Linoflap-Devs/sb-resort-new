"use client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Download, Mail, Printer } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getGuestDetails } from "@/app/ServerAction/manage.action";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface GuestInfo {
  FirstName: string;
  LastName: string;
  BirthDate: string;
  Email: string;
  Contact: string;
  Address1: string;
  Address2?: string;
  City: string;
  ZIPCode: string;
  Country: string;
  [key: string]: any;
}

interface Reservation {
  Id: string;
  GuestId: string;
  RoomType: string;
  CheckInDate: string;
  CheckOutDate: string;
  [key: string]: any;
}

interface RoomAssignment {
  RoomNumber: string;
  ReservationId: string;
  GuestId: string;
  [key: string]: any;
}

interface MergedReservation extends Reservation {
  RoomNumber: string;
}

const defaultGuestInfo: GuestInfo = {
  FirstName: "Anonymous",
  LastName: "Guest",
  BirthDate: "",
  Email: "N/A",
  Contact: "N/A",
  Address1: "N/A",
  City: "N/A",
  ZIPCode: "N/A",
  Country: "N/A",
};

export default function GuestDetailsController({ id = "1" }: { id?: string }) {
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Fetch guest data for download/print
  const { data: guest } = useQuery({
    queryKey: ["GetGuestsDetailsForDownload", id],
    queryFn: async () => {
      const res = await getGuestDetails(id);
      if (!res.success) {
        throw new Error("Failed to fetch guest details");
      }
      return res.res;
    },
    enabled: true,
  });

  // Generate the PDF document layout
  const generatePDFDoc = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185); // Hotel brand color
    doc.text("HOTEL MANAGEMENT SYSTEM", 105, 15, { align: "center" });

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`Guest Number: ${id}`, 105, 30, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Generated on: ${format(new Date(), "MMM dd, yyyy HH:mm")}`,
      105,
      38,
      { align: "center" },
    );

    // Guest Information Section Header
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Guest Information", 14, 50);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 53, 196, 53);

    // Two-column layout for guest details
    // Use a default object if guest data is not available.
    const guestInfo: GuestInfo =
      guest && guest[0] ? (guest[0] as GuestInfo) : defaultGuestInfo;

    const xLeft = 14;
    const xRight = 105;
    let yLeft = 65;
    let yRight = 65;

    // Left Column: Name, Birth Date, Address (one line)
    doc.setFont("helvetica", "bold");
    doc.text("Name:", xLeft, yLeft);
    doc.setFont("helvetica", "normal");
    doc.text(`${guestInfo.FirstName} ${guestInfo.LastName}`, xLeft + 25, yLeft);

    yLeft += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Birth Date:", xLeft, yLeft);
    doc.setFont("helvetica", "normal");
    // Increased spacing: using xLeft + 35 instead of +25
    doc.text(
      guestInfo.BirthDate
        ? format(new Date(guestInfo.BirthDate), "MMM dd, yyyy")
        : "N/A",
      xLeft + 35,
      yLeft,
    );

    yLeft += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Address:", xLeft, yLeft);
    doc.setFont("helvetica", "normal");
    const addressLine = [
      guestInfo.Address1,
      guestInfo.Address2 || "",
      guestInfo.City,
      guestInfo.ZIPCode,
      guestInfo.Country,
    ]
      .filter((item) => item && item.trim() !== "")
      .join(", ");
    doc.text(addressLine || "N/A", xLeft + 25, yLeft);

    // Right Column: Email, Phone
    doc.setFont("helvetica", "bold");
    doc.text("Email:", xRight, yRight);
    doc.setFont("helvetica", "normal");
    doc.text(guestInfo.Email, xRight + 25, yRight);

    yRight += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Phone:", xRight, yRight);
    doc.setFont("helvetica", "normal");
    doc.text(guestInfo.Contact, xRight + 25, yRight);

    // Reservation History Section
    const reservationStartY = Math.max(yLeft, yRight) + 15;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Reservation History", 14, reservationStartY);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, reservationStartY + 3, 196, reservationStartY + 3);

    // Merge reservation and room assignment data
    const reservations = guest && guest[1] ? (guest[1] as Reservation[]) : [];
    const roomAssignments =
      guest && guest[2] ? (guest[2] as RoomAssignment[]) : [];

    const mergedReservationData: MergedReservation[] = reservations.map(
      (reservation: Reservation) => {
        const matchingRoom = roomAssignments.find(
          (room: RoomAssignment) => room.ReservationId === reservation.Id,
        );
        return {
          ...reservation,
          RoomNumber: matchingRoom ? matchingRoom.RoomNumber : "Unassigned",
        };
      },
    );

    if (mergedReservationData.length > 0) {
      const tableStartY = reservationStartY + 10;
      autoTable(doc, {
        startY: tableStartY,
        head: [
          [
            "Reservation ID",
            "Room Type",
            "Room Number",
            "Check-in",
            "Check-out",
          ],
        ],
        body: mergedReservationData.map((res: MergedReservation) => [
          res.Id,
          res.RoomType,
          res.RoomNumber,
          res.CheckInDate
            ? format(new Date(res.CheckInDate), "MMM dd, yyyy")
            : "N/A",
          res.CheckOutDate
            ? format(new Date(res.CheckOutDate), "MMM dd, yyyy")
            : "N/A",
        ]),
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
      });
    } else {
      doc.setFontSize(11);
      doc.text("No reservation history found.", 14, reservationStartY + 10);
    }

    // Footer for all pages
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: "center" });
      doc.text("Confidential - For Internal Use Only", 105, 290, {
        align: "center",
      });
    }
    return doc;
  };

  // Download PDF handler
  const handleDownload = async () => {
    if (!guest) return;
    setIsDownloading(true);
    try {
      const doc = generatePDFDoc();
      doc.save(`Guest_${id}_Details.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Print PDF handler
  const handlePrint = async () => {
    if (!guest) return;
    setIsPrinting(true);
    try {
      const doc = generatePDFDoc();
      doc.autoPrint();
      window.open(doc.output("bloburl"), "_blank");
    } catch (error) {
      console.error("Error printing PDF:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="border-b border-cstm-secondary">
      <div className="px-4 py-2">
        <div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.back()}
              className="h-min rounded bg-cstm-secondary p-1"
            >
              <ChevronLeft size="20" />
            </Button>
            <h1 className="text-2xl font-semibold">Guest Number: {id}</h1>
            <span className="text-sm font-light text-foreground">Details</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between bg-cstm-primary/50 px-4 py-1">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" className="h-min rounded bg-black p-1">
                <Mail size="20" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Resend Email</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                onClick={handlePrint}
                className="h-min rounded bg-gray-500 p-1"
                disabled={isPrinting || !guest}
              >
                <Printer size="20" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isPrinting ? "Printing..." : "Print Document"}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                onClick={handleDownload}
                className={`h-min rounded ${
                  isDownloading ? "bg-green-300" : "bg-green-500"
                } p-1`}
                disabled={isDownloading || !guest}
              >
                <Download size="20" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isDownloading ? "Generating PDF..." : "Download Details"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
