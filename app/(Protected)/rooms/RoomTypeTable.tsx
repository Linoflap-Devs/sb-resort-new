"use client";
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
import {
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
  Ellipsis,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteRoomType, getRoomTypes } from "@/app/ServerAction/rooms.action";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AlertConfirmDelete from "@/components/AlertConfirmDelete";
import { toast } from "sonner";
import { useTranslation } from "next-export-i18n";

interface RoomType {
  Id: string;
  TypeName: string;
  MaxAdult: number;
  MaxChild: number;
  Rooms: { count: number }[];
  CreatedAt: Date;
}

export default function RoomTypeTable() {
  const router = useRouter();
  const { t } = useTranslation();
  const roomsI18n = t("RoomsPage");
  const generaI18n = t("general");
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string>("");

  const deleteMutation = useMutation({
    mutationKey: ["deleteRoomType"],
    mutationFn: async (data: any) => {
      const res = await deleteRoomType(data);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res;
    },
    onSuccess: () => {
      toast.success("Room Type Deleted", {
        description: "Room Type Deleted Successfully",
      });
      refetch();
    },
    onError: (error) => {
      toast.error("Deleting Room Type Failed"),
        {
          description:
            "There was an error deleting the Room Type. Please try again later.",
        };
    },
  });

  const columns: ColumnDef<RoomType>[] = [
    {
      accessorKey: "Id",
      header: "ID",
      enableHiding: false,
    },
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
              {roomsI18n.typeName}{" "}
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
      enableHiding: false,
    },
    {
      accessorKey: "BedType",
      header: ({ column }: any) => {
        return (
          <div className="flex">
            <Button
              className="flex gap-1 bg-transparent p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {roomsI18n.bedType}{" "}
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
    },
    {
      accessorKey: "Rooms",
      header: ({ column }: any) => {
        return (
          <div className="flex justify-end">
            <Button
              className="flex gap-1 bg-transparent p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {generaI18n.quantity}{" "}
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
        return <div className="text-right">{cell.getValue()[0].count}</div>;
      },
    },
    {
      accessorKey: "MaxAdult",
      header: ({ column }: any) => {
        return (
          <div className="flex justify-end">
            <Button
              className="flex gap-1 bg-transparent p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {roomsI18n.maxAdults}{" "}
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
        return <div className="text-right">{cell.getValue()}</div>;
      },
    },
    {
      accessorKey: "MaxChild",
      header: ({ column }: any) => {
        return (
          <div className="flex justify-end">
            <Button
              className="flex gap-1 bg-transparent p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {roomsI18n.maxChildren}{" "}
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
        return <div className="text-right">{cell.getValue()}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }: any) => {
        const payment = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <Ellipsis className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{generaI18n.actions}</DropdownMenuLabel>
              {/* <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(payment.id)}
              >
                Copy payment ID
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  router.push(`editroomtype/${row.original.Id}`);
                }}
              >
                {generaI18n.edit}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  console.log(row.original.Id);
                  setSelectedId(row.original.Id);
                  setOpenDeleteModal(true);
                }}
                className="font-medium text-red-500"
              >
                {generaI18n.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const {
    data: roomTypes,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["GetRoomTypes"],
    queryFn: async () => (await getRoomTypes()).res as RoomType[],
  });

  return (
    <div className="px-4">
      <AlertConfirmDelete
        openState={openDeleteModal}
        onOpenChange={setOpenDeleteModal}
        onConfirm={() => deleteMutation.mutate(selectedId)}
      />
      <DetailedDataTable
        pageSize={8}
        isLoading={isLoading}
        data={roomTypes || []}
        columns={columns}
        title={"Room Types"}
        columnToSearch={["TypeName", "BedType"]}
        searchPlaceholder={roomsI18n.searchRoomType}
        pagination={true}
        visibility={{ Id: false }}
      />
    </div>
  );
}
