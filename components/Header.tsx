"use client";
import { usePathname } from "next/navigation";
import UserProfile from "./UserProfile";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function Header({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) {
  const currentPath = usePathname();

  const navigationItems = [
    {
      name: "Dashboard",
      url: "/dashboard",
    },
    {
      name: "Rooms",
      url: "/rooms",
      subNav: [
        {
          name: "Room Types",
          url: "/rooms/viewroomtypes",
        },
        {
          name: "Add Room Type",
          url: "/rooms/addroomtype",
        },
        {
          name: "Edit Room Type",
          url: "/rooms/editroomtype/",
        },
        {
          name: "Available Rooms",
          url: "/rooms/availability",
        },
        {
          name: "Amenities",
          url: "/rooms/amenities"
        }
      ],
    },
    {
      name: "Reservations",
      url: "/reservations",
      subNav: [
        {
          name: "Billing",
          url: "/reservations/billing",
        },
        {
          name: "Reservations Details",
          url: "/reservations/details",
        },
      ],
    },
    {
      name: "Reports",
      url: "/reports",
      subNav: [
        {
          name: "Sales",
          url: "/reports/sales",
        },
        {
          name: "Audit Log",
          url: "/reports/auditlog",
        },
        {
          name: "Payment Mode",
          url: "/reports/paymentmode",
        },
        {
          name: "Devices",
          url: "/reports/devices",
        },
      ],
    },

    {
      name: "Management",
      url: "/management",
      subNav: [
        {
          name: "Users",
          url: "/management/users",
        },
        {
          name: "Guests",
          url: "/management/guests",
        },
      ],
    },

    {
      name: "Promos",
      url: "/promos",
    },
    {
      name: "Discounts",
      url: "/discounts",
    },
    {
      name: "Settings",
      url: "/settings"
    },
  ];
  return (
    <div className="h-1/12 w-full bg-cstm-secondary">
      <div className="flex w-full flex-row justify-end px-6 py-2">
        <UserProfile firstName={firstName} lastName={lastName} />
      </div>
      <div className="flex w-full items-center gap-2 border-b-2 border-cstm-secondary bg-cstm-primary px-6 py-1">
        <Breadcrumb>
          <BreadcrumbList className="text-cstm-tertiary">
            {navigationItems
              .flatMap((item) => {
                if (item.subNav) {
                  return [item, ...item.subNav];
                }
                return item;
              })
              .map((item, index) => {
                if (currentPath.includes(item.url)) {
                  return (
                    <div className="flex items-center gap-2" key={index}>
                      <BreadcrumbItem>
                        <BreadcrumbLink href={item.url}>
                          {item.name}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                    </div>
                  );
                }
                return null;
              })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
