"use client";
import {
  BabyIcon,
  CalendarIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  CircleAlertIcon,
  CircleUserIcon,
  Info,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SelectComponent from "@/components/SelectComponent";
import { useGlobalStore } from "@/store/useGlobalStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { add, addDays, format } from "date-fns";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  addOnlineReservation,
  addReservationsLobby,
  editReservations,
} from "@/app/ServerAction/reservations.action";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "next-export-i18n";
import { Textarea } from "@/components/ui/textarea";
import {
  capitalizeFirstLetter,
  computeInitialBooking,
  convertToLocalUTCTime,
  findWeekdaysInRange,
  formatCurrencyJP,
  getPercentage,
} from "@/utils/Helpers";
import { countries } from "@/data/countries";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { RoomRate } from "@/types";
import { DatePicker } from "@/components/ui/calendar2";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { checkDiscount } from "@/app/ServerAction/discounts.action";
import { checkPromoWalkIn, getPromo } from "@/app/ServerAction/promos.action";

export default function AddReservationModal() {
  const {
    addReservationModalState,
    setAddReservationModalState,
    availableRoomsQuery,
    roomTypesQuery,
    roomRatesQuery,
    reservationQuery,
    appliedDiscount,
    setAppliedDiscount,
    appliedPromo,
    setAppliedPromo,
    reservationTypeOptionsQuery,
  } = useGlobalStore();
  const { data: reservationTypeOptions, isLoading: reservationTypeLoading } =
    reservationTypeOptionsQuery();
  const [childCapacity, setChildCapacity] = useState(0);
  const [adultCapacity, setAdultCapacity] = useState(0);
  const [extraChild, setExtraChild] = useState(0);
  const [extraAdult, setExtraAdult] = useState(0);
  const [days, setDays] = useState<{ weekends: number; weekdays: number }>({
    weekends: 0,
    weekdays: 0,
  });
  const [roomRate, setRoomRate] = useState<RoomRate>({} as RoomRate);
  const [submissionLoading, setSubmissionLoading] = useState(false);

  const formSchema = z.object({
    dateRange: z
      .object(
        {
          from: z.date(),
          to: z.date(),
        },
        {
          message: "Please select a date range",
        },
      )
      .default({ from: new Date(), to: addDays(new Date(), 1) })
      .refine((data) => data.from < data.to, {
        path: ["dateRange"],
        message: "Check-In date must be before Check-Out date",
      }),
    roomType: z.string().min(1, { message: "Please select a room type." }),
    reservationType: z
      .string()
      .min(1, { message: "Please select a reservation method." }),
    adultGuests: z.coerce
      .number()
      .min(1, { message: "Adults must be at least 1." }),
    childGuests: z.coerce.number().min(0),
    extraAdult: z.coerce.number().min(0),
    extraChild: z.coerce.number().min(0),
    request: z.string().optional(),
    firstName: z
      .string()
      .min(1, { message: "First name must contain at least 1 character." }),
    lastName: z
      .string()
      .min(1, { message: "First name must contain at least 1 character." }),
    birthday: z.date(),
    email: z.string().email().min(1, { message: "Invalid email format." }),
    phoneNumber: z
      .string()
      .min(9, { message: "Phone number must contain at least 9 digits." })
      .max(11, { message: "Phone number must contain at most 11 digits." }),
    country: z.string(),
    address1: z.string(),
    address2: z.string().optional(),
    city: z.string().min(1, { message: "Please enter a city" }),
    province: z.string().min(1, { message: "Please enter a province" }),
    zipCode: z.coerce.string().min(1, { message: "Please enter a zip code" }),
    discount: z.string(),
    promo: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateRange: { from: new Date(), to: addDays(new Date(), 1) },
      roomType: undefined,
      reservationType: undefined,
      adultGuests: undefined,
      childGuests: undefined,
      extraAdult: 0,
      extraChild: 0,
      request: "",
      firstName: "",
      lastName: "",
      birthday: undefined,
      email: "",
      phoneNumber: "",
      country: "Philippines",
      discount: "",
      promo: "",
    },
  });

  const { data, isLoading, refetch } = availableRoomsQuery(
    form.getValues("dateRange").from,
    form.getValues("dateRange").to,
  );
  const {
    data: roomTypeData,
    isLoading: roomTypeLoading,
    refetch: roomTypeRefetch,
  } = roomTypesQuery();
  const {
    data: roomRateData,
    isLoading: roomRateLoading,
    refetch: roomRateRefetch,
  } = roomRatesQuery();
  const { refetch: reservationRefetch } = reservationQuery();
  const [discountLoading, setDiscountLoading] = useState<boolean>(false);
  const [promoLoading, setPromoLoading] = useState<boolean>(false);
  const [initialBill, setInitialBill] = useState<number>(0);

  async function checkVoucher(voucherCode: string) {
    if (voucherCode == "") {
      form.setError("discount", { message: "Please enter a discount code." });
      form.clearErrors("promo");
      return;
    } else {
      setDiscountLoading(true);
      setAppliedDiscount({} as any);
      const data = await checkDiscount(voucherCode, {
        roomTypeId: roomTypeData?.find(
          (room: any) =>
            room.TypeName.toLowerCase() ==
            form.getValues("roomType")?.toString().toLowerCase(),
        )?.Id,
        startDate: form.getValues("dateRange.from"),
        endDate: form.getValues("dateRange.to"),
        nights: days.weekdays + days.weekends,
        bill: initialBill,
      });

      if (data.success) {
        setAppliedPromo({} as any);
        setAppliedDiscount({
          id: data.res?.Id,
          name: data.res?.DiscountName,
          code: data.res?.DiscountCode,
          type: data.res?.DiscountType,
          value: data.res?.DiscountValue,
        });
        form.setValue("promo", "");
        form.clearErrors("discount");
      }
      if (!data.success) {
        form.setError("discount", { message: data.message });
      }
      console.log(data);
      setDiscountLoading(false);
    }
  }

  function removeDiscount() {
    setAppliedDiscount({} as any);
    form.clearErrors("discount");
    form.setValue("discount", "");
  }

  async function checkPromo(promoCode: string) {
    if (promoCode == "") {
      form.setError("promo", { message: "Please enter a promo code." });
      form.clearErrors("discount");
      return;
    } else {
      setPromoLoading(true);
      setAppliedPromo({} as any);
      const data = await checkPromoWalkIn(promoCode);
      console.log(data);

      if (data.success && data.res) {
        setAppliedPromo(data.res);
        setAppliedDiscount({} as any);

        form.clearErrors("promo");
        form.clearErrors("discount");

        form.setValue("discount", "");
        form.setValue("roomType", data.res.RoomType.toLowerCase());
      }
      if (!data.success) {
        form.setError("promo", { message: data.message });
      }

      setPromoLoading(false);
    }
  }

  function removePromo() {
    setAppliedPromo({} as any);
    form.clearErrors("promo");
    form.setValue("promo", "");
    form.setValue("roomType", "");
    setRoomRate({
      RateTypeId: 0,
      RoomTypeId: 0,
      RoomType: "",
      MaxAdult: 0,
      MaxChild: 0,
      Description: "",
      BedTypeId: 0,
      Id: 0,
      BaseRoomRate: 0,
      ExtraAdultRate: 0,
      ExtraChildRate: 0,
      WeekendExtraAdultRate: 0,
      WeekendExtraChildRate: 0,
      WeekendRoomRate: 0,
      CreatedAt: new Date(),
    });
  }

  useEffect(() => {
    refetch();
    setDays(
      findWeekdaysInRange(
        form.getValues("dateRange").from,
        form.getValues("dateRange").to,
      ),
    );
  }, [form.watch("dateRange")]);

  useEffect(() => {
    setAdultCapacity(
      roomTypeData?.find(
        (room: any) =>
          room.TypeName.toLowerCase() ==
          form.getValues("roomType")?.toString().toLowerCase(),
      )?.MaxAdult,
    );
    setChildCapacity(
      roomTypeData?.find(
        (room: any) =>
          room.TypeName.toLowerCase() ==
          form.getValues("roomType")?.toString().toLowerCase(),
      )?.MaxChild,
    );
  }, [form.watch("roomType"), roomTypeData]);

  /*setRoomRate({
            "RateTypeId": 0,
            "RoomTypeId": 0,
            "RoomType": "",
            "MaxAdult": 0,
            "MaxChild": 0,
            "Description": "",
            "BedTypeId": 0,
            "Id": 0,
            "BaseRoomRate": 0,
            "ExtraAdultRate": 0,
            "ExtraChildRate": 0,
            "WeekendExtraAdultRate": 0,
            "WeekendExtraChildRate": 0,
            "WeekendRoomRate": 0,
            "CreatedAt": new Date()
        });*/

  useEffect(() => {
    if (!roomRateLoading && roomRateData) {
      const rate = roomRateData?.find(
        (rate: any) =>
          rate.RoomType.toLowerCase() == form.getValues("roomType"),
      );
      console.log(appliedPromo.PromoCode);
      if (appliedPromo.PromoCode) {
        setRoomRate({
          RateTypeId: 0,
          RoomTypeId: 0,
          RoomType: "",
          MaxAdult: 0,
          MaxChild: 0,
          Description: "",
          BedTypeId: 0,
          Id: 0,
          BaseRoomRate: 0,
          ExtraAdultRate: 0,
          ExtraChildRate: 0,
          WeekendExtraAdultRate: 0,
          WeekendExtraChildRate: 0,
          WeekendRoomRate: 0,
          CreatedAt: new Date(),
        });
        const promoRate: RoomRate = {
          RateTypeId: 2,
          RoomTypeId: appliedPromo.RoomTypeId,
          RoomType: appliedPromo.RoomType,
          MaxAdult: rate.MaxAdult,
          MaxChild: rate.MaxChild,
          Description: rate.Description,
          BedTypeId: rate.BedTypeId,
          Id: appliedPromo.Id,
          BaseRoomRate: appliedPromo.BaseRoomRate,
          ExtraChildRate: appliedPromo.ExtraChildRate,
          ExtraAdultRate: appliedPromo.ExtraAdultRate,
          WeekendRoomRate: appliedPromo.WeekendRoomRate,
          WeekendExtraChildRate: appliedPromo.WeekendExtraChildRate,
          WeekendExtraAdultRate: appliedPromo.WeekendExtraAdultRate,
          CreatedAt: rate.CreatedAt,
        };
        setRoomRate(promoRate);
      } else {
        setRoomRate(rate);
      }
    }
  }, [form.watch("roomType"), roomRateData]);

  useEffect(() => {
    console.log(form.getValues("adultGuests"), adultCapacity);
    if (form.getValues("adultGuests") > adultCapacity) {
      setExtraAdult(form.getValues("adultGuests") - adultCapacity);
    } else {
      setExtraAdult(0);
    }
  }, [form.watch("adultGuests"), adultCapacity]);

  useEffect(() => {
    if (form.getValues("childGuests") > childCapacity) {
      setExtraChild(form.getValues("childGuests") - childCapacity);
    } else {
      setExtraChild(0);
    }
  }, [form.watch("childGuests"), childCapacity]);

  useEffect(() => {
    if (appliedDiscount.code) {
      checkVoucher(appliedDiscount.code);
    } else if (appliedPromo.PromoCode) {
      checkPromo(appliedPromo.PromoCode);
    }
  }, [roomRate]);

  useEffect(() => {
    setInitialBill(
      computeInitialBooking(
        roomRate,
        days.weekends,
        days.weekdays,
        extraAdult,
        extraChild,
      ) *
        0.12 +
        computeInitialBooking(
          roomRate,
          days.weekends,
          days.weekdays,
          extraAdult,
          extraChild,
        ),
    );
    console.log(
      computeInitialBooking(
        roomRate,
        days.weekends,
        days.weekdays,
        extraAdult,
        extraChild,
      ) *
        0.12 +
        computeInitialBooking(
          roomRate,
          days.weekends,
          days.weekdays,
          extraAdult,
          extraChild,
        ),
    );
  }, [
    roomRate,
    form.watch("dateRange"),
    form.watch("adultGuests"),
    form.watch("childGuests"),
    form.watch("extraAdult"),
    form.watch("extraChild"),
  ]);

  useEffect(() => {
    if (appliedDiscount) {
      if (appliedDiscount.type == "percentage") {
        setInitialBill(
          initialBill - initialBill * (appliedDiscount.value / 100),
        );
      }
      if (appliedDiscount.type == "flat") {
        setInitialBill(initialBill - appliedDiscount.value);
      }
    }
  }, [appliedDiscount]);

  useEffect(() => {
    console.log(form.getValues("country"));
    console.log(roomRateData);
    setRoomRate({
      RateTypeId: 0,
      RoomTypeId: 0,
      RoomType: "",
      MaxAdult: 0,
      MaxChild: 0,
      Description: "",
      BedTypeId: 0,
      Id: 0,
      BaseRoomRate: 0,
      ExtraAdultRate: 0,
      ExtraChildRate: 0,
      WeekendExtraAdultRate: 0,
      WeekendExtraChildRate: 0,
      WeekendRoomRate: 0,
      CreatedAt: new Date(),
    });
  }, []);

  const addMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      setSubmissionLoading(true);
      const roomTypeId = roomTypeData?.find(
        (room: any) =>
          room.TypeName.toLowerCase() ===
          form.getValues("roomType")?.toString().toLowerCase(),
      )?.Id;

      const res = await addOnlineReservation(
        capitalizeFirstLetter(values.firstName),
        capitalizeFirstLetter(values.lastName),
        values.birthday,
        values.email,
        values.phoneNumber,
        "",
        1,
        roomTypeId,
        new Date(convertToLocalUTCTime(values.dateRange.from)),
        new Date(convertToLocalUTCTime(values.dateRange.to)),
        values.extraChild,
        values.extraAdult,
        roomRate.Id,
        1,
        values.country,
        values.request || "",
        appliedDiscount.id || null,
        values.address1,
        values.address2 || "",
        values.city,
        values.province,
        values.zipCode,
        values.adultGuests,
        values.childGuests,
        Number(values.reservationType),
      );

      if (!res.success) throw new Error(res.res);
      return res.res;
    },
    onSuccess(data, variables, context) {
      setSubmissionLoading(false);
      form.reset();
      setAddReservationModalState(false);
      reservationRefetch();
      toast.success("Success", {
        description: "Reservation added successfully.",
      });
    },
    onError(error, variables, context) {
      setSubmissionLoading(false);
      console.log(error);
      toast.error("Oops!", {
        description: "Something went wrong. Please try again later.",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("onSubmit function");
    addMutation.mutate(values);
    console.log(values);
  }

  return (
    <Dialog
      open={addReservationModalState}
      onOpenChange={(open) => {
        form.reset();
        setAddReservationModalState(open);
        setAdultCapacity(0);
        setChildCapacity(0);
        setExtraAdult(0);
        setExtraChild(0);
        setRoomRate({
          RateTypeId: 0,
          RoomTypeId: 0,
          RoomType: "",
          MaxAdult: 0,
          MaxChild: 0,
          Description: "",
          BedTypeId: 0,
          Id: 0,
          BaseRoomRate: 0,
          ExtraAdultRate: 0,
          ExtraChildRate: 0,
          WeekendExtraAdultRate: 0,
          WeekendExtraChildRate: 0,
          WeekendRoomRate: 0,
          CreatedAt: new Date(),
        });
        setDays({ weekends: 0, weekdays: 0 });
        setAppliedDiscount({} as any);
        setAppliedPromo({} as any);
      }}
    >
      <DialogContent className="overflow-y-auto sm:max-h-[800px] sm:max-w-[1200px]">
        <DialogHeader>
          <DialogTitle>Add Reservation</DialogTitle>
          <DialogDescription>
            Create a reservation for a walk-in customer.
          </DialogDescription>
        </DialogHeader>
        <div className="">
          <Form {...form}>
            <form className="flex" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex max-h-[600px] w-1/2 flex-col gap-4 overflow-y-scroll border-r px-8">
                <FormField
                  name="dateRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">
                        Check In/Out Dates
                      </FormLabel>
                      <FormControl className=" ">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value?.from ? (
                                field.value?.to ? (
                                  <>
                                    {format(field.value?.from, "LLL dd, y")} -{" "}
                                    {format(field.value?.to, "LLL dd, y")}
                                  </>
                                ) : (
                                  format(field.value?.from, "LLL dd, y")
                                )
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              initialFocus
                              mode="range"
                              defaultMonth={field.value?.from}
                              selected={field.value}
                              onSelect={useCallback(field.onChange, [])}
                              numberOfMonths={1}
                              disabled={(date) => {
                                return date <= new Date();
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormDescription>
                        Select a date range to get a list of available room
                        types.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                {isLoading && !data ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="animate-spin" />
                    <p className="text-black/[.50]">Loading...</p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col border-b pb-4">
                      <p className="text-lg font-bold">Room Details</p>
                      <div className="flex gap-4">
                        <div className="w-1/2">
                          <FormField
                            name="roomType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel
                                  onClick={() =>
                                    console.log(
                                      field.value,
                                      roomTypeData,
                                      roomTypeData.find(
                                        (room: any) =>
                                          room.TypeName.toLowerCase() ==
                                          field.value.toLowerCase(),
                                      ),
                                      field,
                                    )
                                  }
                                >
                                  Room Type
                                </FormLabel>
                                <FormControl className=" ">
                                  <SelectComponent
                                    className="w-full"
                                    setState={field.onChange}
                                    state={field.value}
                                    disabled={
                                      appliedPromo.PromoCode ? true : false
                                    }
                                    options={
                                      Array.from(
                                        new Set(
                                          data?.map(
                                            (room: any) => room.room_type,
                                          ),
                                        ),
                                      ).map((roomType: any) => ({
                                        value: roomType,
                                        label: roomType,
                                      })) || [
                                        { value: "Single", label: "Single" },
                                      ]
                                    }
                                    placeholder={"Select room type..."}
                                  />
                                </FormControl>
                                <FormDescription>
                                  {field.value ? (
                                    <div className="flex gap-4">
                                      {
                                        <>
                                          <div className="flex gap-2">
                                            <CircleUserIcon className="h-4 w-4" />
                                            <p>
                                              {
                                                roomTypeData.find(
                                                  (room: any) =>
                                                    room.TypeName.toLowerCase() ==
                                                    field.value.toLowerCase(),
                                                )?.MaxAdult
                                              }{" "}
                                              Adults
                                            </p>
                                          </div>

                                          <div className="flex gap-2">
                                            <BabyIcon className="h-4 w-4" />
                                            <p>
                                              {
                                                roomTypeData.find(
                                                  (room: any) =>
                                                    room.TypeName.toLowerCase() ==
                                                    field.value.toLowerCase(),
                                                )?.MaxChild
                                              }{" "}
                                              Children
                                            </p>
                                          </div>
                                        </>
                                      }
                                    </div>
                                  ) : (
                                    ""
                                  )}
                                </FormDescription>
                                <FormMessage></FormMessage>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="w-1/2">
                          {/* New Reservation Method dropdown */}
                          <FormField
                            name="reservationType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Reservation Method</FormLabel>
                                <FormControl>
                                  <SelectComponent
                                    className="w-full"
                                    setState={field.onChange}
                                    state={field.value}
                                    disabled={reservationTypeLoading}
                                    options={
                                      reservationTypeOptions?.map(
                                        (option: any) => ({
                                          value: option.value.toString(),
                                          label: option.label,
                                        }),
                                      ) || []
                                    }
                                    placeholder={"Select reservation method..."}
                                  />
                                </FormControl>
                                <FormDescription></FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      <div className="mt-2 flex gap-4">
                        <div className="w-1/2">
                          <FormField
                            name="adultGuests"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Adult Guests</FormLabel>
                                <FormControl className=" ">
                                  <Input {...field} type="number" />
                                </FormControl>
                                <FormDescription>
                                  {field.value && form.getValues("roomType") ? (
                                    <>
                                      {field.value >
                                      roomTypeData.find(
                                        (room: any) =>
                                          room.TypeName.toLowerCase() ==
                                          form
                                            .getValues("roomType")
                                            .toString()
                                            .toLowerCase(),
                                      )?.MaxAdult ? (
                                        <div className="flex gap-2 text-orange-500">
                                          <CircleAlertIcon
                                            className="h-4 w-4"
                                            color="currentColor"
                                          />
                                          <p className="text-orange-500">
                                            {field.value -
                                              roomTypeData.find(
                                                (room: any) =>
                                                  room.TypeName.toLowerCase() ==
                                                  form
                                                    .getValues("roomType")
                                                    .toString()
                                                    .toLowerCase(),
                                              )?.MaxAdult}{" "}
                                            extra guest
                                          </p>
                                        </div>
                                      ) : (
                                        ""
                                      )}
                                    </>
                                  ) : (
                                    <p></p>
                                  )}
                                </FormDescription>
                                <FormMessage></FormMessage>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="w-1/2">
                          <FormField
                            name="childGuests"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Child Guests</FormLabel>
                                <FormControl className=" ">
                                  <Input {...field} type="number" />
                                </FormControl>
                                <FormDescription>
                                  {field.value && form.getValues("roomType") ? (
                                    <>
                                      {field.value > childCapacity ? (
                                        <div className="flex gap-2 text-orange-500">
                                          <CircleAlertIcon
                                            className="h-4 w-4"
                                            color="currentColor"
                                          />
                                          <p className="text-orange-500">
                                            {field.value - childCapacity} extra
                                            guest
                                          </p>
                                        </div>
                                      ) : (
                                        ""
                                      )}
                                    </>
                                  ) : (
                                    <p></p>
                                  )}
                                </FormDescription>
                                <FormMessage></FormMessage>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      <div className="">
                        <FormField
                          name="request"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Special Requests</FormLabel>
                              <FormControl className=" ">
                                <Textarea
                                  className="border"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage></FormMessage>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col border-b pb-4">
                      <p className="text-lg font-bold">Guest Details</p>
                      <div className="flex gap-4">
                        <div className="w-1/2">
                          <FormField
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl className=" ">
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage></FormMessage>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="w-1/2">
                          <FormField
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl className=" ">
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage></FormMessage>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex flex-col gap-4">
                        <div>
                          <FormField
                            name="birthday"
                            render={({ field }) => (
                              <FormItem className={cn("col-span-4")}>
                                <div className="flex items-center gap-2">
                                  <FormLabel>Birth Date</FormLabel>
                                </div>
                                <FormControl>
                                  <DatePicker
                                    date={field.value}
                                    setDate={field.onChange}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="">
                          <FormField
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl className=" ">
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage></FormMessage>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="">
                          <FormField
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl className=" ">
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage></FormMessage>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4 border-b pb-4">
                      <p className="text-lg font-bold">Billing Address</p>
                      <div className="flex gap-4">
                        <div className="w-1/2">
                          <FormField
                            name="address1"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address 1</FormLabel>
                                <FormControl className=" ">
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage></FormMessage>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="w-1/2">
                          <FormField
                            name="address2"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address 2</FormLabel>
                                <FormControl className=" ">
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage></FormMessage>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-1/2">
                          <FormField
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl className=" ">
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage></FormMessage>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="w-1/2">
                          <FormField
                            name="province"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Province / State / Region</FormLabel>
                                <FormControl className=" ">
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage></FormMessage>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-1/2">
                          <FormField
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ZIP Code</FormLabel>
                                <FormControl className=" ">
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage></FormMessage>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold">Promo / Discount</p>
                      <Tooltip data-align="start">
                        <TooltipTrigger asChild>
                          <span className="text-muted-foreground">
                            <Info stroke="currentColor" size={14}></Info>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          Only one of discount or promo can be active.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex gap-4 pb-4">
                      <div className="flex w-full flex-col gap-4">
                        <FormField
                          name="promo"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel>
                                Promo Code{" "}
                                {appliedPromo
                                  ? "(" + appliedPromo.PromoCode + ")"
                                  : ""}
                              </FormLabel>
                              <div className="flex w-full gap-4">
                                <FormControl className="flex flex-1">
                                  <div className="relative">
                                    <div className="z-1 justify center absolute right-0 top-0 flex h-full items-center pr-3">
                                      <Tooltip data-align="start">
                                        <TooltipTrigger asChild>
                                          <span className="text-muted-foreground">
                                            <Info
                                              stroke="currentColor"
                                              size={14}
                                            ></Info>
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          Applying a promo overrides selected
                                          room details.
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                    <Input {...field} />
                                  </div>
                                </FormControl>
                                <Button
                                  disabled={promoLoading}
                                  type="button"
                                  onClick={() =>
                                    appliedPromo.PromoCode
                                      ? removePromo()
                                      : checkPromo(field.value)
                                  }
                                  className={`w-32 min-w-32 ${appliedPromo.PromoCode ? "bg-red-500" : "bg-cstm-primary"} text-white`}
                                >
                                  {promoLoading ? (
                                    <Loader2 className="animate-spin" />
                                  ) : appliedPromo.PromoCode ? (
                                    "Remove"
                                  ) : (
                                    "Apply"
                                  )}
                                </Button>
                              </div>
                              <FormMessage></FormMessage>
                            </FormItem>
                          )}
                        />
                        <FormField
                          name="discount"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel>Discount</FormLabel>
                              <div className="flex w-full gap-4">
                                <FormControl className="relative flex flex-1">
                                  <Input
                                    {...field}
                                    disabled={discountLoading}
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  disabled={discountLoading}
                                  onClick={() =>
                                    appliedDiscount.code
                                      ? removeDiscount()
                                      : checkVoucher(field.value)
                                  }
                                  className={`w-32 min-w-32 ${appliedDiscount.code ? "bg-red-500" : "bg-cstm-primary"} text-white`}
                                >
                                  {discountLoading ? (
                                    <Loader2 className="animate-spin" />
                                  ) : appliedDiscount.code ? (
                                    "Remove"
                                  ) : (
                                    "Apply"
                                  )}
                                </Button>
                              </div>
                              <FormMessage></FormMessage>
                            </FormItem>
                          )}
                        />
                        {/* <Button type="button" onClick={() => console.log(appliedDiscount, appliedPromo, form.getValues("roomType"), roomRate)}>DEBUG</Button> */}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex w-1/2 flex-col justify-between px-8">
                <div className="flex h-fit w-full flex-col rounded border border-gray-200 bg-white p-4 shadow-lg">
                  <p
                    className="text-lg font-bold"
                    onClick={() => {
                      console.log(roomRate);
                    }}
                  >
                    Booking Summary
                  </p>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 text-sm">
                      {appliedPromo.PromoCode && (
                        <div className="flex items-center justify-between">
                          <p className="font-bold">Promo Code</p>
                          <div className="flex flex-col items-end">
                            <span className="rounded bg-cstm-secondary p-1 text-white">
                              {appliedPromo.PromoCode}
                            </span>
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="font-bold">Room</p>
                        <div className="ms-4 flex flex-col gap-2">
                          {days?.weekdays > 0 && (
                            <div className="flex justify-between">
                              <p className="text-black/[.70]">
                                {days.weekdays} Weekday(s)
                              </p>
                              <p className="font-bold text-black">
                                ¥
                                {formatCurrencyJP(
                                  roomRate?.BaseRoomRate * days.weekdays,
                                )}
                              </p>
                            </div>
                          )}
                          {days?.weekends > 0 && (
                            <div className="flex justify-between">
                              <p className="text-black/[.70]">
                                {days.weekends} Weekend(s)
                              </p>
                              <p className="font-bold text-black">
                                ¥
                                {formatCurrencyJP(
                                  roomRate?.WeekendRoomRate * days.weekends,
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      {(extraAdult > 0 || extraChild > 0) &&
                        form.getValues("roomType") && (
                          <div>
                            <div>
                              <p className="font-bold">Extra Guests</p>
                              <div className="ms-4 flex flex-col gap-2">
                                <div className="flex justify-between">
                                  <p className="text-black/[.70]">
                                    Adults x{extraAdult}
                                  </p>
                                  <p className="font-bold text-black">
                                    ¥
                                    {formatCurrencyJP(
                                      roomRate?.WeekendExtraAdultRate *
                                        extraAdult *
                                        days.weekends +
                                        roomRate?.ExtraAdultRate *
                                          extraAdult *
                                          days.weekdays,
                                    )}
                                  </p>
                                </div>
                                <div className="flex justify-between">
                                  <p className="text-black/[.70]">
                                    Child x{extraChild}
                                  </p>
                                  <p className="font-bold text-black">
                                    ¥
                                    {formatCurrencyJP(
                                      roomRate.ExtraChildRate *
                                        extraChild *
                                        days.weekdays +
                                        roomRate.WeekendExtraChildRate *
                                          extraChild *
                                          days.weekends,
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      <hr></hr>
                      <div className="flex justify-between">
                        <p className="text-black/[.70]">Subtotal</p>
                        <p className="font-bold text-black">
                          ¥
                          {formatCurrencyJP(
                            computeInitialBooking(
                              roomRate,
                              days.weekends,
                              days.weekdays,
                              extraAdult,
                              extraChild,
                            ),
                          )}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-black/[.70]">
                          VAT{" "}
                          <span className="text-sm text-black/[.50]">
                            (12%)
                          </span>
                        </p>
                        <p className="font-bold text-black">
                          ¥
                          {formatCurrencyJP(
                            computeInitialBooking(
                              roomRate,
                              days.weekends,
                              days.weekdays,
                              extraAdult,
                              extraChild,
                            ) * 0.12,
                          )}
                        </p>
                      </div>
                      {appliedDiscount.code && (
                        <div className="flex justify-between">
                          <p className="text-black/[.70]">Discount Code</p>
                          <div className="flex flex-col items-end">
                            <p className="font-bold text-green-500">
                              {appliedDiscount.type === "percentage"
                                ? `- ¥${formatCurrencyJP(getPercentage(initialBill, appliedDiscount.value))}`
                                : `- ¥${formatCurrencyJP(appliedDiscount.value)}`}
                            </p>
                            <p className="text-end text-sm text-white">
                              {appliedDiscount.code
                                ? appliedDiscount.type === "percentage"
                                  ? `${appliedDiscount.code} (${appliedDiscount.value}% off)`
                                  : `${appliedDiscount.code}`
                                : "None"}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="p-t-2 border-t-2">
                        {/* <span>Total Bill</span>
                                <span className="font-bold">
                                    {`₱ ${commafy(
                                    selectedBillingData?.TotalPerAddOn +
                                        selectedBillingData?.InitialBill -
                                        selectedBillingData?.Deposit,
                                    )}`}
                                </span> */}
                        <div className="mt-2 flex items-start justify-between rounded-md bg-cstm-secondary p-4">
                          <p className="text-white/[.70]">TOTAL</p>
                          <p className="text-3xl font-bold text-white">
                            {/* ¥{formatCurrencyJP((computeInitialBooking(roomRate, days.weekends, days.weekdays, extraAdult, extraChild) * 0.12) + computeInitialBooking(roomRate, days.weekends, days.weekdays, extraAdult, extraChild))} */}
                            ¥{formatCurrencyJP(initialBill)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    onClick={() => {
                      console.log(form.formState.errors);
                    }}
                    className="w-full text-white"
                    disabled={isLoading || submissionLoading}
                  >
                    {submissionLoading ? (
                      <Loader2
                        size={16}
                        color="currentColor"
                        className="animate-spin"
                      />
                    ) : (
                      "Add Reservation"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
