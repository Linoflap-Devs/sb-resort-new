import {
  getAmenities,
  getAvailableRoomsRPC,
  getBedTypeOptions,
  getCurrentRoomTypesRate,
  getRoomRates,
  getRoomRateTypeOptions,
  getRooms,
  getRoomStatusOptions,
  getRoomTypeOptions,
  getRoomTypes,
  getBedTypes,
} from "@/app/ServerAction/rooms.action";
import { useQuery } from "@tanstack/react-query";
import { create } from "zustand";
import { enUS, ja, Locale } from "date-fns/locale";
import { checkReservation, getAddOns, getAddOnsTypeOpt, getBillings, getReservations, getReservationSummary, updateCheckInTime, updateCheckOutTime } from "@/app/ServerAction/reservations.action";
import { getGuests, getUsers } from "@/app/ServerAction/manage.action";
import { getPromos } from "@/app/ServerAction/promos.action";
import { getDeviceReservation } from "@/app/ServerAction/reports.action";
import { DateRange } from "react-day-picker";
import { Reservation, MainOptions, Room, RoomRate, ReservationSummaryRecord } from "@/types";
import { getConfig, transformConfig } from "@/app/ServerAction/config.action";
import { getAllDiscountRoomTypes, getDiscounts, toggleDiscountStatus, updateDiscount } from "@/app/ServerAction/discounts.action";

export const useGlobalStore = create<GlobalState>()((set) => ({

  companyName: "ABCName",
  setCompanyName: (name: string) => set(() => ({companyName: name})),

  imageUploadMaxMB: 2,
  setImageUploadMaxMB: (data: number) => set(() => ({imageUploadMaxMB: data})),

  localeFns: {
    en: enUS,
    ja: ja,
  },
  /* Add/Edit RoomForm States */
  selectedRoomData: null,
  setSelectedRoomData: (data) => set(() => ({ selectedRoomData: data })),

  // History States
  lastVisitedUrl: "",
  setLastVisitedUrl: (data) => set(() => ({ lastVisitedUrl: data })),

  roomFormModalState: false,
  setRoomFormModalState: (data) => set(() => ({ roomFormModalState: data })),
  /* Add/Edit RoomRates States */
  selectedRateData: "",
  setSelectedRateData: (data) => set(() => ({ selectedRateData: data })),
  rateFormModalState: false,
  setRateFormModalState: (data) => set(() => ({ rateFormModalState: data })),

  /* Reservation */
  reservationFormModalState: false,
  setReservationFormModalState: (data) => set(() => ({ reservationFormModalState: data })),
  selectedReservationData: {} as Reservation,
  setSelectedReservationData: (data) => set(() => ({ selectedReservationData: data })),
  addReservationModalState: false,
  setAddReservationModalState: (data: boolean) => set(() => ({ addReservationModalState: data })),

  // Available Rooms

  availableRoomsDateSelect: { from: new Date(), to: new Date() },
  setAvailableRoomsDateSelect: (data) =>
    set(() => ({ availableRoomsDateSelect: data })),

  /* Billing Form Modal */
  billingFormModalState: false,
  setBillingFormModalState: (data) =>
    set(() => ({ billingFormModalState: data })),
  selectedBillingData: {},
  setSelectedBillingData: (data) => set(() => ({ selectedBillingData: data })),
  billingAddOnFormModalState: false,
  setBillingAddOnFormModalState: (data) =>
    set(() => ({ billingAddOnFormModalState: data })),
  finilizeBillingModalState: false,
  setFinilizeBillingModalState: (data) => set(() => ({ finilizeBillingModalState: data })),

  /* Add On */
  addOnModalState: false,
  setAddOnModalState: (data) => set(() => ({ addOnModalState: data })),
  selectedAddOnData: {},
  setSelectedAddOnData: (data) => set(() => ({ selectedAddOnData: data })),


  /* User */
  userFormModalState: false,
  setUserFormModalState: (data) => set(() => ({ userFormModalState: data })),

  /* Promos Form Modal */
  promosFormModalState: false,
  setPromosFormModalState: (data) =>
    set(() => ({ promosFormModalState: data })),
  selectedPromoData: {},
  setSelectedPromoData: (data) => set(() => ({ selectedPromoData: data })),
  appliedPromo: {} as any,
  setAppliedPromo: (data) => set(() => ({ appliedPromo: data })),

  /* Manage Guest/User */
  guestFormModalState: false,
  setGuestFormModalState: (data) => set(() => ({ guestFormModalState: data })),
  selectedGuestData: {},
  setSelectedGuestData: (data) => set(() => ({ selectedGuestData: data })),

  /* Filter Options */
  selectedRoomTypeOpt: "",
  setSelectedRoomTypeOpt: (data) => set(() => ({ selectedRoomTypeOpt: data })),
  selectedRoomStatusOpt: "",
  setSelectedRoomStatusOpt: (data) =>
    set(() => ({ selectedRoomStatusOpt: data })),
  reservationFilterRoomTypeOpt: "",
  setReservationFilterRoomTypeOpt: (data) =>
    set(() => ({ reservationFilterRoomTypeOpt: data })),
  reservationFilterStatusOpt: "",
  setReservationFilterStatusOpt: (data) =>
    set(() => ({ reservationFilterStatusOpt: data })),
  addOnFilterType: "",
  setAddOnFilterType: (data) => set(() => ({ addOnFilterType: data })),
  userRoleFilterOpt: "",
  setUserRoleFilterOpt: (data) => set(() => ({ userRoleFilterOpt: data })),
  selectedRoomTypePromosFilter: "",
  setSelectedRoomTypePromosFilter: (data) => set(() => ({ selectedRoomTypePromosFilter: data })),
  selectedBillingStatusFilter: "",
  setSelectedBillingStatusFilter: (data) => set(() => ({ selectedBillingStatusFilter: data })),
  selectedBillingReservationStatusFilter: "",
  setSelectedBillingReservationStatusFilter: (data) => set(() => ({ selectedBillingReservationStatusFilter: data })),
  selectedRoomRateRoomTypeFilter: "",
  setSelectedRoomRateRoomTypeFilter: (data: string) => set(() => ({selectedRoomRateRoomTypeFilter: data})),
  selectedBedTypeFilter: "",
  setSelectedBedTypeFilter: (data: string) => set(() => ({selectedBedTypeFilter: data})),
  // Guest

  guestEditModalState: false,
  setGuestEditModalState: (state: boolean) => set(() => ({ guestEditModalState: state })),
  
  // Reports
  selectedReportRange: { from: new Date("January 1 " + new Date().getFullYear()), to: new Date("December 31 " + new Date().getFullYear) } as DateRange,
  setSelectedReportRange: (range: any) => set(() => ({ selectedReportRange: range })),

  resetSelectOptState: () => {
    set({
      selectedRoomTypePromosFilter: "",
      selectedRoomTypeOpt: "",
      selectedRoomStatusOpt: "",
      reservationFilterRoomTypeOpt: "",
      reservationFilterStatusOpt: "",
      addOnFilterType: "",
      userRoleFilterOpt: "",
      selectedBillingStatusFilter: "",
      selectedDiscountsFilter: "",
      selectedBillingReservationStatusFilter: "",
      selectedBedTypeFilter: "",
    });
  },

  // Amenity
  selectedAmenity: [],
  setSelectedAmenity: (amenity: any) => set(() => ({ selectedAmenity: amenity })),
  amenityFormModalState: false,
  setAmenityFormModalState: (state: boolean) => set(() => ({ amenityFormModalState: state })), 

  // Bed Type
   selectedBedType: [],
  setSelectedBedType: (amenity: any) => set(() => ({ selectedBedType: amenity })),
  bedTypeFormModalState: false,
  setBedTypeFormModalState: (state: boolean) => set(() => ({ bedTypeFormModalState: state })), 

  // Discounts
  discountFormModalState: false,
  setDiscountFormModalState: (state: boolean) => set(() => ({ discountFormModalState: state })),
  selectedDiscountData: {},
  setSelectedDiscountData: (data: any) => set(() => ({ selectedDiscountData: data })),
  selectedDiscountsFilter: "",
  setSelectedDiscountsFilter: (data: any) => set(() => ({ selectedDiscountsFilter: data })),
  selectedDiscountRoomType: [],
  setSelectedDiscountRoomType: (data: any) => set(() => ({ selectedDiscountRoomType: data })),
  appliedDiscount: {} as any,
  setAppliedDiscount: (data: any) => set((state) => ({ ...state, appliedDiscount: data })),

  roomTypesQuery: () => {
    return useQuery({
      queryKey: ["GetRoomTypes"],
      queryFn: async () => (await getRoomTypes()).res,
    })
  },

  usersQuery: () => {
    return useQuery({
      queryKey: ["getUsers"],
      queryFn: async () => {
        const res = await getUsers();
        return res.res;
      },
    });
  },
  roomTypeOptionsQuery: () => {
    return useQuery<MainOptions[]>({
      queryKey: ["GetRoomTypeOptions"],
      queryFn: async () => (await getRoomTypeOptions()).res as MainOptions[],
    });
  },
  roomStatusOptionsQuery: () => {
    return useQuery<MainOptions[]>({
      queryKey: ["GetRoomStatusOptions"],
      queryFn: async () => (await getRoomStatusOptions()).res as MainOptions[],
    });
  },
  roomRateTypesQuery: () => {
    return useQuery({
      queryKey: ["GetRoomRateTypes"],
      queryFn: async () =>
        (await getRoomRateTypeOptions()).res as MainOptions[],
    });
  },
  roomsQuery: () => {
    return useQuery({
      queryKey: ["GetRooms"],
      queryFn: async () => (await getRooms()).res as Room[],
    });
  },
  bedTypeOptionsQuery: () => {
    return useQuery<MainOptions[]>({
      queryKey: ["GetBedTypeOptions"],
      queryFn: async () => (await getBedTypeOptions()).res as MainOptions[],
    });
  },
  roomRatesQuery: () => {
    return useQuery<RoomRate[]>({
      queryKey: ["GetRoomRates"],
      queryFn: async () => {
        const data = await getRoomRates();
        //console.log(data)
        return data.res as RoomRate[]
        //return (await getRoomRates()).res as RoomRate[],
      }
    });
  },
  reservationQuery: () => {
    return useQuery({
      queryKey: ["GetReservations"],
      queryFn: async () => (await getReservations()).res as Reservation[],
    });
  },
  billingsQuery: () => {
    return useQuery({
      queryKey: ["GetBillings"],
      queryFn: async () => (await getBillings()).res as any,
    });

  },
  addOnQuery: () => {
    return useQuery({
      queryKey: ["GetAddOns"],
      queryFn: async () => {
        return (await getAddOns()).res as any;
      },
    });
  },
  addOnTypeQuery: () => {
    return useQuery({
      queryKey: ["GetAddOnsTypeOpt"],
      queryFn: async () => {
        return (await getAddOnsTypeOpt()).res as any;
      },
    });
  },
  promosQuery: () => {
    return useQuery({
      queryKey: ["GetPromos"],
      queryFn: async () => {
        return (await getPromos()).res as any;
      },
    });
  },
  deviceReservationQuery: () => {
    return useQuery({
      queryKey: ["GetDeviceReservation"],
      queryFn: async () => {
        return (await getDeviceReservation()).res as any;
      },
    });
  },

  guestQuery: () => {
    return useQuery({
      queryKey: ["GetGuests"],
      queryFn: async () => {
        return (await getGuests()).res as any;
      }
    })
  },

  availableRoomsQuery: (to: Date, from: Date) => {
    return useQuery({
      queryKey: ["GetAvailableRooms"],
      queryFn: async () => {
        //console.log(to, from)
        return (await getAvailableRoomsRPC(to,from)).res as any
      }
    })
  },

  amenityQuery: () => {
    return useQuery({
      queryKey: ["GetAmenities"],
      queryFn: async () => {
        return (await getAmenities()).res as any
      }
    })
  },
  bedTypeQuery: () => {
    return useQuery({
      queryKey: ["getBedTypes"],
      queryFn: async () => {
        return (await getBedTypes()).res as any
      }
    })
  },

  reservationSummaryQuery: () => {
    return useQuery({
      queryKey: ["GetReservationSummary"],
      queryFn: async () => {
        return (await getReservationSummary()).res as ReservationSummaryRecord[]
      }
    })
  },

  updateCheckInTimeQuery: (reservationId: number, time: Date) => {
    return useQuery({
      queryKey: ["updateCheckInTime"],
      queryFn: async () => {
        return (await updateCheckInTime(reservationId, time)).res
      }
    })
  },

  updateCheckOutTimeQuery: (reservationId: number, time: Date) => {
    return useQuery({
      queryKey: ["updateCheckOutTime"],
      queryFn: async () => {
        return (await updateCheckOutTime(reservationId, time)).res
      }
    })
  },

  getConfigQuery: () => {
    return useQuery({
      queryKey: ["GetConfig"],
      queryFn: async () => {
        try {
          const result = await transformConfig();
          return result
        }
        catch (error) {
          console.error("Config query error:", error);
          throw error;
        }
      },
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      retry: 1
    })
  },

  checkReservationQuery: (id: number) => {
    return useQuery({
      queryKey: ["CheckReservation", id],
      queryFn: async () => checkReservation(id)
    })
  },

  getDiscountsQuery: () => {
    return useQuery({
      queryKey: ["GetDiscounts"],
      queryFn: async () => {  
        return (await getDiscounts()).res as any
      }
    })
  },

  getAllDiscountRoomTypeQuery: () => {
    return useQuery({
      queryKey: ["GetDiscountRoomTypes"],
      queryFn: async () => {
        return (await getAllDiscountRoomTypes()).res as any
      }
    })
  }

  // updateDiscountStatusQuery: (id: number, state: boolean) => {
  //   return useQuery({
  //     queryKey: ["UpdateDiscountStatus"],
  //     queryFn: async () => {
  //       return (await toggleDiscountStatus(id, state)).res
  //     }
  //   })
  // },




}));

interface GlobalState {

  /* Company Info */
  companyName: string,
  setCompanyName: (name: string) => void,

  // General
  imageUploadMaxMB: number,
  setImageUploadMaxMB: (value: number) => void,

  // History State
  lastVisitedUrl: string,
  setLastVisitedUrl: (value: string) => void,

  localeFns: { [key: string]: Locale };
  /*  RoomForm States */
  roomFormModalState: boolean;
  setRoomFormModalState: (state: boolean) => void;
  selectedRoomData: any;
  setSelectedRoomData: (room: any) => void;
  /*RoomRates States */
  rateFormModalState: boolean;
  setRateFormModalState: (state: boolean) => void;
  selectedRateData: any;
  setSelectedRateData: (room: any) => void;

  // Available Rooms
  availableRoomsDateSelect: DateRange;
  setAvailableRoomsDateSelect: (data: DateRange) => void;

  /* Reservation */
  reservationFormModalState: boolean;
  setReservationFormModalState: (state: boolean) => void;
  selectedReservationData: Reservation;
  setSelectedReservationData: (data: Reservation) => void;
  addReservationModalState: boolean;
  setAddReservationModalState: (state: boolean) => void;

  /* Billing */
  billingFormModalState: boolean;
  setBillingFormModalState: (state: boolean) => void;
  billingAddOnFormModalState: boolean;
  setBillingAddOnFormModalState: (data: boolean) => void;
  selectedBillingData: any;
  setSelectedBillingData: (data: any) => void;
  finilizeBillingModalState: boolean;
  setFinilizeBillingModalState: (data: boolean) => void;


  /* Add On */
  addOnModalState: boolean;
  setAddOnModalState: (data: boolean) => void;
  selectedAddOnData: any;
  setSelectedAddOnData: (data: any) => void;

  /* User */
  userFormModalState: boolean;
  setUserFormModalState: (state: boolean) => void;

  /* Promos  */
  promosFormModalState: boolean;
  setPromosFormModalState: (state: boolean) => void;
  selectedPromoData: any;
  setSelectedPromoData: (data: any) => void;
  addOnFilterType: string;
  setAddOnFilterType: (data: string) => void;
  appliedPromo: { Id: number, PromoName: string, PromoCode: string,  ExpiredAt: Date, RedemptionLeft: number, RoomTypeId: number, RoomType: string, BaseRoomRate: number, ExtraChildRate: number, ExtraAdultRate: number, WeekendRoomRate: number, WeekendExtraChildRate: number, WeekendExtraAdultRate: number }
  setAppliedPromo: (promo: { Id: number, PromoName: string, PromoCode: string,  ExpiredAt: Date, RedemptionLeft: number, RoomTypeId: number, RoomType: string, BaseRoomRate: number, ExtraChildRate: number, ExtraAdultRate: number, WeekendRoomRate: number, WeekendExtraChildRate: number, WeekendExtraAdultRate: number }) => void

  /*
  {
    "Id": 31,
    "PromoCode": "DELUXE2024",
    "PromoName": "DELUXE2024",
    "RedemptionLeft": 43,
    "ExpiredAt": "2025-02-28",
    "RoomRateId": 54,
    "RoomTypeId": 13,
    "BaseRoomRate": 100,
    "ExtraChildRate": 100,
    "ExtraAdultRate": 100,
    "WeekendRoomRate": 100,
    "WeekendExtraChildRate": 100,
    "WeekendExtraAdultRate": 100,
    "RoomType": "Deluxe"
}*/
  /* Billing Details */

  /* Report */
  selectedReportRange: any
  setSelectedReportRange: (data: any) => void

  /* Queries */
  /* Room */
  usersQuery: () => any;
  roomTypeOptionsQuery: () => any;
  roomStatusOptionsQuery: () => any;
  bedTypeOptionsQuery: () => any;
  roomsQuery: () => any;
  roomRatesQuery: () => any;
  roomRateTypesQuery: () => any;
  billingsQuery: () => any;
  addOnTypeQuery: () => any;
  addOnQuery: () => any;
  reservationQuery: () => any;
  promosQuery: () => any;
  deviceReservationQuery: () => any;
  availableRoomsQuery:(to: Date, from: Date)  => any;
  roomTypesQuery: () => any;
  reservationSummaryQuery: () => any;
  checkReservationQuery: (id: number) => any;

  /* Filters */
  selectedRoomTypeOpt: string;
  setSelectedRoomTypeOpt: (data: string) => void;
  selectedRoomStatusOpt: string;
  setSelectedRoomStatusOpt: (data: string) => void;
  reservationFilterRoomTypeOpt: string;
  setReservationFilterRoomTypeOpt: (data: string) => void;
  reservationFilterStatusOpt: string;
  setReservationFilterStatusOpt: (data: string) => void;
  userRoleFilterOpt: string;
  selectedRoomTypePromosFilter: string;
  selectedRoomRateRoomTypeFilter: string;
  setSelectedRoomRateRoomTypeFilter: (data: string) => void;
  selectedBedTypeFilter: string;
  setSelectedBedTypeFilter: (data: string) => void;
  setSelectedRoomTypePromosFilter: (data: string) => void;
  selectedBillingStatusFilter: string;
  setSelectedBillingStatusFilter: (data: string) => void;
  selectedBillingReservationStatusFilter: string;
  setSelectedBillingReservationStatusFilter: (data: string) => void;
  setUserRoleFilterOpt: (data: string) => void;
  resetSelectOptState: () => void;

  // Guest
  guestFormModalState: boolean;
  setGuestFormModalState: (state: boolean) => void;
  selectedGuestData: any;
  setSelectedGuestData: (data: any) => void;
  guestQuery: () => any;
  guestEditModalState: boolean;
  setGuestEditModalState: (state: boolean) => void

  // Amenities
  selectedAmenity: any;
  setSelectedAmenity: (data: any) => void;
  amenityFormModalState: boolean;
  setAmenityFormModalState: (state: boolean) => void;
  amenityQuery: () => any;

  // Bed TYpes
  selectedBedType: any;
  setSelectedBedType: (data: any) => void;
  bedTypeFormModalState: boolean;
  setBedTypeFormModalState: (state: boolean) => void;
  bedTypeQuery: () => any;

  // Config
  getConfigQuery: () => any;

  // Discounts
  getDiscountsQuery: () => any;
  // updateDiscountStatusQuery: () => any;
  getAllDiscountRoomTypeQuery: () => any;
  selectedDiscountData: any;
  setSelectedDiscountData: (data: any) => void;
  discountFormModalState: any;
  setDiscountFormModalState: (state: boolean) => void; 
  selectedDiscountsFilter: any;
  setSelectedDiscountsFilter: (data: any) => void;
  selectedDiscountRoomType: any
  setSelectedDiscountRoomType: (data: any) => void;
  appliedDiscount: { id: number, name: string, code: string, type: string, value: number }
  setAppliedDiscount: (discount: { id: number, name: string, code: string, type: string, value: number }) => void
}


