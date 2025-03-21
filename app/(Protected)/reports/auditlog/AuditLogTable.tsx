"use client";
import { getAuditLog } from "@/app/ServerAction/reports.action";
import DetailedDataTable from "@/components/DetailedDataTable";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
} from "lucide-react";

export default function AuditLogTable() {
  const { data: auditLog, isLoading } = useQuery({
    queryKey: ["GetAuditLog"],
    queryFn: async () => (await getAuditLog()).res as any,
  });
  const columns = [
    {
      accessorKey: "Id",
      header: "ID",
    },
    {
      accessorKey: "user",
      header: "User",
      cell: ({ cell, row }: any) => {
        return (
          <div>
            {row.getValue("FirstName")} {row.getValue("LastName")}
          </div>
        );
      },
    },
    {
      accessorKey: "TableName",
      header: "Module",
    },
    {
      accessorKey: "ActionName",
      header: "Action",
    },
    {
      accessorKey: "ChangedAt",
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
      cell: ({ cell }: any) => {
        const date = new Date(cell.getValue() || "00");
        return (
          <div className="text-center">
            {format(date, "MMM dd, yyyy, h:mm a")}
          </div>
        );
      },
    },
    {
      accessorKey: "FirstName",
    },
    {
      accessorKey: "LastName",
    },
  ];
  const data = [
    {
      id: "1",
      action: "Login",
      firstName: "Jean",
      lastName: "Doe",
      role: "Frontdesk",
      createdAt: "2022-01-01",
    },
    {
      id: "2",
      action: "Login",
      firstName: "Jean",
      lastName: "Doe",
      role: "Admin",
      createdAt: "2022-01-01",
    },
    {
      id: "3",
      action: "Login",
      firstName: "Jean",
      lastName: "Doe",
      role: "Frontdesk",
      createdAt: "2022-01-01",
    },
    {
      id: "4",
      action: "Login",
      firstName: "Jean",
      role: "Admin",
      lastName: "Doe",
      createdAt: "2022-01-01",
    },
    {
      id: "5",
      action: "Login",
      firstName: "Jean",
      lastName: "Doe",
      role: "Admin",
      createdAt: "2022-01-01",
    },
    {
      id: "6",
      action: "Login",
      firstName: "Jean",
      lastName: "Doe",
      role: "Admin",
      createdAt: "2022-01-01",
    },
    {
      id: "7",
      action: "Login",
      firstName: "Jean",
      lastName: "Doe",
      role: "Admin",
      createdAt: "2022-01-01",
    },
    {
      id: "8",
      action: "Login",
      firstName: "Jean",
      lastName: "Doe",
      role: "Admin",
      createdAt: "2022-01-01",
    },
    {
      id: "9",
      action: "Login",
      firstName: "Jean",
      lastName: "Doe",
      role: "Admin",
      createdAt: "2022-01-01",
    },
    {
      id: "10",
      action: "Login",
      firstName: "Jean",
      lastName: "Doe",
      role: "Admin",
      createdAt: "2022-01-01",
    },
    {
      id: "11",
      action: "Login",
      firstName: "Jean",
      lastName: "Doe",
      role: "Admin",
      createdAt: "2022-01-01",
    },
    {
      id: "12",
      action: "Login",
      firstName: "Jean",
      lastName: "Doe",
      role: "Admin",
      createdAt: "2022-01-01",
    },
    {
      id: "13",
      action: "Login",
      firstName: "Jean",
      lastName: "Doe",
      role: "Admin",
      createdAt: "2022-01-01",
    },
    {
      id: "14",
      action: "Login",
      firstName: "Jean",
      lastName: "Doe",
      role: "Admin",
      createdAt: "2022-01-01",
    },
    {
      id: "15",
      action: "Login",
      firstName: "Jean",
      lastName: "Doe",
      role: "Admin",
      createdAt: "2022-01-01",
    },
    {
      id: "16",
      action: "Login",
      firstName: "Jean",
      lastName: "Doe",
      role: "Admin",
      createdAt: "2022-01-01",
    },
  ];

  return (
    <div className="p-4">
      <DetailedDataTable
        title="Audit Log"
        columns={columns}
        columnToSearch={[
          "ActionName",
          "TableName",
          "ChangedAt",
          "FirstName",
          "LastName",
          "user",
        ]}
        isLoading={isLoading}
        data={auditLog}
        pagination={true}
        pageSize={12}
        visibility={{
          Id: false,
          FirstName: false,
          LastName: false,
        }}
      />
    </div>
  );
}
