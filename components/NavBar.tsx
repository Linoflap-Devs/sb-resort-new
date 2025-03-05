"use client";
// import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  BadgeDollarSign,
  BadgePercent,
  BedDouble,
  BookOpenCheck,
  BriefcaseBusiness,
  ChevronRight,
  CircleUserRound,
  CoinsIcon,
  DoorOpen,
  MonitorSpeaker,
  Puzzle,
  SettingsIcon,
  StickyNote,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { memo } from "react";
import { useTranslation } from "next-export-i18n";
import { LinkWithLocale as Link } from "next-export-i18n";
import { useConfig } from "@/utils/ConfigProvider";

type NavigationItem = {
  name: string;
  url: string;
  icon: React.ReactNode;
  role: number[];
  showAtSubNav?: boolean;
  subNav?: NavigationItem[];
};
const NavBar = memo(function ({
  className,
  role,
}: {
  className?: string;
  role: number;
}) {
  const config = useConfig();
  const currentPath = usePathname();
  const { t } = useTranslation();
  const navBari18n = t("NavBar");
  const logoStyle = {
    size: 22,
    subSize: 20,
    strokeWidth: 2,
  };
  const navigationItems: NavigationItem[] = [
    {
      name: navBari18n.dashboard,
      url: "/dashboard",
      icon: (
        <AreaChart size={logoStyle.size} strokeWidth={logoStyle.strokeWidth} />
      ),
      role: [2, 3],
      showAtSubNav: false,
      subNav: [],
    },
    {
      name: navBari18n.rooms,
      url: "/rooms",
      icon: (
        <BedDouble size={logoStyle.size} strokeWidth={logoStyle.strokeWidth} />
      ),
      role: [1, 2, 3],
      showAtSubNav: true,
      subNav: [
        {
          name: navBari18n.roomTypes,
          url: "/rooms/viewroomtypes",
          icon: <BedDouble />,
          role: [2, 3],
        },
        {
          name: navBari18n.AvailableRooms,
          url: "/rooms/availability",
          icon: <BedDouble />,
          role: [1, 2, 3],
        },
        {
          name: navBari18n.roomRates,
          url: "/rooms/roomrates",
          icon: <BedDouble />,
          role: [2, 3],
        },
        {
          name: navBari18n.amenities,
          url: "/rooms/amenities",
          icon: <BedDouble />,
          role: [2, 3],
        },
        {
          name: "Bed Types",
          url: "/rooms/bedtype",
          icon: <BedDouble />,
          role: [2, 3],
        },
      ],
    },
    {
      name: navBari18n.reservations,
      url: "/reservations",
      icon: (
        <DoorOpen size={logoStyle.size} strokeWidth={logoStyle.strokeWidth} />
      ),
      role: [1, 2, 3],
      showAtSubNav: true,
      subNav: [
        {
          name: navBari18n.billings,
          url: "/reservations/billing",
          icon: (
            <BadgeDollarSign
              size={logoStyle.size}
              strokeWidth={logoStyle.strokeWidth}
            />
          ),
          role: [1, 2, 3],
        },
        {
          name: navBari18n.addOns,
          url: "/reservations/addOns",
          icon: (
            <Puzzle size={logoStyle.size} strokeWidth={logoStyle.strokeWidth} />
          ),
          role: [2, 3],
        },
      ],
    },
    {
      name: navBari18n.reports,
      url: "/reports",
      icon: (
        <StickyNote size={logoStyle.size} strokeWidth={logoStyle.strokeWidth} />
      ),
      role: [2, 3],
      showAtSubNav: false,
      subNav: [
        {
          name: navBari18n.sales,
          url: "/reports/sales",
          icon: (
            <BadgeDollarSign
              size={logoStyle.size}
              strokeWidth={logoStyle.strokeWidth}
            />
          ),
          role: [2, 3],
        },

        {
          name: navBari18n.auditLog,
          url: "/reports/auditlog",
          icon: (
            <BookOpenCheck
              size={logoStyle.subSize}
              strokeWidth={logoStyle.strokeWidth}
            />
          ),
          role: [2, 3],
        },

        {
          name: navBari18n.devices,
          url: "/reports/devices",
          icon: (
            <MonitorSpeaker
              size={logoStyle.subSize}
              strokeWidth={logoStyle.strokeWidth}
            />
          ),
          role: [2, 3],
        },
      ],
    },
    {
      name: navBari18n.manage,
      url: "/management",
      icon: (
        <BriefcaseBusiness
          size={logoStyle.size}
          strokeWidth={logoStyle.strokeWidth}
        />
      ),
      role: [1, 2, 3],
      showAtSubNav: false,
      subNav: [
        {
          name: navBari18n.guests,
          url: "/management/guests",
          icon: (
            <CircleUserRound
              size={logoStyle.subSize}
              strokeWidth={logoStyle.strokeWidth}
            />
          ),
          role: [1, 2, 3],
        },
        {
          name: navBari18n.users,
          url: "/management/users",
          icon: (
            <Users
              size={logoStyle.subSize}
              strokeWidth={logoStyle.strokeWidth}
            />
          ),
          role: [2, 3],
        },
      ],
    },
    {
      name: navBari18n.promos,
      url: "/promos",
      icon: (
        <BadgePercent
          size={logoStyle.size}
          strokeWidth={logoStyle.strokeWidth}
        />
      ),
      role: [1, 2, 3],
      showAtSubNav: false,
      subNav: [],
    },
    {
      name: navBari18n.discounts,
      url: "/discounts",
      icon: (
        <CoinsIcon size={logoStyle.size} strokeWidth={logoStyle.strokeWidth} />
      ),
      role: [1, 2, 3],
      showAtSubNav: false,
      subNav: [],
    },
    {
      name: navBari18n.settings,
      url: "/settings",
      icon: (
        <SettingsIcon
          size={logoStyle.size}
          strokeWidth={logoStyle.strokeWidth}
        />
      ),
      role: [3],
      showAtSubNav: false,
      subNav: [],
    },
  ] as const;
  const drawer = {
    hidden: {
      height: 0,
    },
    visible: {
      height: "auto",
      transition: {
        duration: 0.5,
        type: "spring",
      },
    },
    exit: {
      height: 0,
      transition: {
        duration: 0.2,
      },
    },
  };
  return (
    <div
      className={cn(
        `flex flex-col justify-between bg-cstm-secondary shadow-xl`,
        className,
      )}
    >
      <div className="space-y-10">
        <h1 className="w-full bg-cstm-secondary p-4 text-center text-4xl font-semibold text-cstm-tertiary">
          {/* {t("NavBar.beachName")} */}
          {config.CompanyName}
        </h1>
        <div className="flex flex-col gap-4">
          {navigationItems.map((item, index) => {
            const selected = currentPath.includes(item.url);
            if (!item.role.includes(role)) {
              return null;
            }
            return (
              <div key={index}>
                <Link
                  className={`text-md flex flex-row items-center gap-3 rounded-r-3xl py-2 font-semibold shadow-lg transition-all ${
                    selected
                      ? "w-11/12 border-cstm bg-cstm-primary pl-11 text-white"
                      : "w-10/12 bg-cstm-background pl-9 hover:w-11/12 hover:bg-cstm-primary hover:pl-11 hover:text-white"
                  } }`}
                  href={item.url}
                >
                  <span>{item.icon}</span>
                  {item.name}
                  {item.subNav && item.subNav.length !== 0 ? (
                    !selected ? (
                      <ChevronRight />
                    ) : (
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 90 }}
                        transition={{ duration: 0.2 }}
                        exit={{ rotate: 0 }}
                      >
                        <ChevronRight />
                      </motion.div>
                    )
                  ) : null}
                </Link>
                <AnimatePresence>
                  {item.subNav && item.subNav.length !== 0 && selected && (
                    <motion.div
                      variants={drawer}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="mt-1 flex flex-col gap-1 overflow-hidden"
                    >
                      {item.showAtSubNav && (
                        <Link
                          className={`flex flex-row items-center gap-3 rounded-r-3xl py-1 text-sm font-semibold shadow transition-all ${
                            item.url === currentPath
                              ? "w-10/12 bg-cstm-secondary-dark pl-12 text-white"
                              : "w-8/12 bg-cstm-background pl-8 hover:w-9/12 hover:bg-cstm-primary hover:pl-9 hover:text-white"
                          }`}
                          href={item.url}
                        >
                          {item.name}
                        </Link>
                      )}
                      {item.subNav.map((subItem, index) => {
                        const selected = currentPath.includes(subItem.url);
                        if (!subItem.role.includes(role)) return null;
                        return (
                          <Link
                            href={subItem.url}
                            key={index}
                            className={`flex flex-row items-center gap-3 rounded-r-3xl py-1 text-sm font-semibold shadow transition-all ${
                              selected
                                ? "w-10/12 bg-cstm-secondary-dark pl-12 text-white"
                                : "w-8/12 bg-cstm-background pl-8 hover:w-9/12 hover:bg-cstm-primary hover:pl-9 hover:text-white"
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
export default NavBar;
