"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { isString, useEditor } from "@tiptap/react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { number, z } from "zod";
import { useRef } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import {
  ArrowUpIcon,
  AtSignIcon,
  BabyIcon,
  BedDoubleIcon,
  Book,
  Calendar as CalendarIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  CircleUserRoundIcon,
  Loader,
  Loader2,
  PhoneIcon,
} from "lucide-react";
import { format, formatDate } from "date-fns";
import { cn } from "@/lib/utils";
import { useBookingStore } from "@/store/useBookingStore";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getAvailableRoomTypeRPC,
  getCurrentRoomTypeRate,
  getPromoRoomRate,
  getRoomAmenities,
  getRoomsTypOptions,
  getRoomTypeRates,
} from "../ServerAction/rooms.action";
import parse from "html-react-parser";
import {
  capitalizeFirstLetter,
  commafy,
  convertToLocalUTCTime,
  dateAnalysis,
  emailStringConfirmBooking,
  formatCurrencyJP,
  generateReferenceNumber,
  getPercentage,
} from "@/utils/Helpers";
import {
  addOnlineReservation,
  checkReferenceNumber,
  checkReservation,
  peekLastReservation,
} from "../ServerAction/reservations.action";
import { useRouter } from "next/navigation";
import { getPromo } from "../ServerAction/promos.action";
import { RoomCard } from "@/app/booking/room-card";
import { RoomRatesCard } from "@/app/booking/RoomRatesCard";
import { ToSPrivacyModal } from "./ToSPrivacyModal";
import { DatePicker } from "@/components/ui/calendar2";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingSuccess } from "./BookingSuccess";
import { countries } from "@/data/countries";
import { useConfig } from "@/utils/ConfigProvider";
import {
  SiAmericanexpress,
  SiMastercard,
  SiVisa,
} from "@icons-pack/react-simple-icons";
import sendEmail from "../ServerAction/email.action";
import { checkDiscount } from "../ServerAction/discounts.action";

export default function MainBookingForm() {
  const config = useConfig();
  const formRef = useRef<HTMLFormElement>(null);
  const {
    pageState,
    goPrevPage,
    goNextPage,
    setToSPrivacyModalState,
    setPageState,
  } = useBookingStore();

  const BookingForms = [
    <BookingDateForm formRef={formRef} />,
    <SelectRoomForm formRef={formRef} />,
    <SelectRoomRateForm formRef={formRef} />,
    <CustomerDetailsForm formRef={formRef} />,
    <ConfirmForm formRef={formRef} />,
  ][pageState];

  return (
    <div className="relative flex flex-col justify-end gap-4">
      {BookingForms}
      <div
        className={cn(
          "mx-auto flex justify-center gap-2",
          "sm:w-11/12",
          "md:w-10/12 md:justify-end",
          "lg:w-7/12",
        )}
      >
        {/*         <Button
          disabled={pageState === 0}
          variant={"destructive"}
          onClick={() => {
            console.log(pageState);
            goPrevPage();
          }}
        >
          Back
        </Button>
        <Button
          className="bg-cstm-primary"
          onClick={() => {
            formRef.current?.requestSubmit();
          }}
        >
          Next
        </Button> */}
      </div>
    </div>
  );
}
/* ============================================================== 1 */
function BookingDateForm({
  formRef,
}: {
  formRef: React.RefObject<HTMLFormElement>;
}) {
  const config = useConfig();
  const {
    pageState,
    goNextPage,
    setNumberOfRooms,
    setCheckInRange,
    setPromoCode,
    setPromoDetails,
    goToRoomRates,
    referenceNumber,
    setReferenceNumber,
    checkInRange,
  } = useBookingStore();

  const formSchema = z.object({
    dateRange: z
      .object(
        {
          from: z.date(),
          to: z.date(),
        },
        {
          required_error: "Please select a date range",
        },
      )
      .default({ from: checkInRange.from, to: checkInRange.to })
      .refine((data) => data.from < data.to, {
        path: ["dateRange"],
        message: "From date must be before to date",
      }),
    numberOfRooms: z
      .string()
      .min(1, { message: "Please select a room type" })
      .default("1"),
    promoCode: z
      .string()
      .default("")
      .refine(
        async (data) => {
          const { success, res } = await getPromo(data);
          if (success || data === "") {
            return true;
          }
          return false;
        },
        {
          message: "Please enter a Valid Promo Code",
        },
      ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    shouldUnregister: false,
  });

  const [pageStateLoading, setPageStateLoading] = useState(false);
  const [pageStateTrigger, setPageStateTrigger] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("clickCount", clickCount);
    if (clickCount > 1) return;

    setPageStateLoading(true);
    setClickCount(clickCount + 1);

    setNumberOfRooms(1);
    setCheckInRange(values.dateRange);
    if (values.promoCode) {
      const { success, res } = await getPromo(values.promoCode);
      if (!success) {
        setPageStateLoading(false);
        return;
      }
      console.log("with promo code");
      console.log(res);
      setPromoCode(values.promoCode);
      setPromoDetails(res);
      setClickCount(0);
      goToRoomRates();
    } else {
      console.log("no promo code");
      setPageStateLoading(false);
      setClickCount(0);
      goNextPage();
    }
  }

  useEffect(() => {
    setPromoCode("");
  }, []);

  return (
    <div className="mx-auto rounded-sm p-3">
      <Card className="p-4">
        <div
          className={cn(
            "my-2 flex w-full flex-col items-center justify-between gap-2 rounded-sm bg-cstm-secondary p-2 text-xs text-cstm",
          )}
        >
          <div className="flex flex-wrap justify-center gap-4 md:justify-normal">
            <div className="flex gap-1">
              <p className="font-semibold">Check-In Time:</p>
              <p>02:00 PM</p>
            </div>
            <div className="flex gap-1">
              <p className="font-semibold">Check-Out Time:</p>
              <p>12:00 PM</p>
            </div>
          </div>
          <p className="text-lg text-center md:text-end md:text-xs">
            Rates are subject to change without prior notice and are indicative
            only.
          </p>
        </div>

        <Form {...form}>
          <form
            ref={formRef}
            id="bookingForm"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 md:flex-row"
          >
            {/* <FormField
              name="numberOfRooms"
              render={({ field }) => (
                <FormItem className="w-full md:w-1/3 ">
                  <FormLabel className=" ">Number Of Rooms</FormLabel>
                  <FormControl className=" ">
                    <Input {...field} />
                  </FormControl>
                  <div className="h-4 ">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            /> */}

            <FormField
              name="dateRange"
              render={({ field }) => (
                <FormItem className="mt-4 flex w-full flex-col justify-end md:w-1/2">
                  <FormLabel className=" ">Date</FormLabel>
                  <FormControl className=" ">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
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
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={field.value?.from}
                          selected={field.value}
                          onSelect={field.onChange}
                          numberOfMonths={1}
                          disabled={(date) => {
                            return date <= new Date();
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <div className="h-4">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              name="promoCode"
              render={({ field }) => (
                <FormItem className="w-full md:w-1/2">
                  <FormLabel className=" ">Promo Code</FormLabel>
                  <FormControl className=" ">
                    <Input placeholder="ABCD5678" {...field} />
                  </FormControl>
                  <div className="h-4">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>

        <div className="mt-4 flex flex-col justify-center self-end rounded-lg bg-cstm-primary p-3 text-sm">
          <p className="font-bold text-white">Questions?</p>
          <p className="text-white/[.70]">
            You may reach us through our channels below:
          </p>
          {config.CompanyContact && (
            <div className="mt-4 flex gap-4">
              <PhoneIcon size={16} className="text-white" />
              <p className="text-white/[.70]">{config.CompanyContact}</p>
            </div>
          )}
          {config.CompanyEmail && (
            <div className="flex gap-4">
              <AtSignIcon size={16} className="text-white" />
              <p className="text-wrap text-white/[.70]">
                {config.CompanyEmail}
              </p>
            </div>
          )}
        </div>
      </Card>
      <div className={cn("mt-4 flex justify-center gap-4", "")}>
        <Button
          disabled={pageStateLoading}
          className="bg-cstm-primary"
          type="submit"
          form="bookingForm"
          onClick={() => {
            // used to handle multiple clicks
            setClickCount(clickCount + 1);
          }}
        >
          {pageStateLoading ? (
            <Loader className="h-4 w-4 animate-spin" color="white" />
          ) : (
            <p>Check Availability</p>
          )}
        </Button>
      </div>
    </div>
  );
}
/* ============================================================== 2 */
function SelectRoomForm({
  formRef,
}: {
  formRef: React.RefObject<HTMLFormElement>;
}) {
  const {
    pageState,
    goNextPage,
    goPrevPage,
    setSelectedRoom,
    selectedRoom,
    checkInRange,
  } = useBookingStore();

  const { data: roomTypes, isFetching: roomTypesFetching } = useQuery({
    queryKey: ["GetRoomTypes"],
    queryFn: async () => (await getRoomsTypOptions()).res,
  });

  const { data: roomRates, isFetching: roomRatesFetching } = useQuery({
    queryKey: ["roomRates"],
    queryFn: async () => (await getRoomTypeRates()).res,
  });

  const {
    data: availableRooms,
    isLoading: availableRoomsLoading,
    refetch,
  } = useQuery({
    queryKey: ["availableRooms"],
    queryFn: async () =>
      (await getAvailableRoomTypeRPC(checkInRange.from, checkInRange.to)).res,
  });

  const formSchema = z.object({
    roomType: z.number().min(1, { message: "Please select a room type" }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      roomType: selectedRoom.Id,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    goNextPage();
  }

  function changeSelectedRoom(type: any, disabled: boolean): void {
    if (disabled) {
      return;
    } else {
      setSelectedRoom(type);
    }
  }

  useEffect(() => {
    if (form.formState.errors.roomType?.message) {
      toast.error(form.formState.errors.roomType?.message);
    }
  }, [form.formState.errors.roomType?.message]);

  return (
    <div
      className={cn(
        "mx-auto w-full snap-both snap-mandatory flex-col gap-4 overflow-auto rounded-sm p-2",
        "xl:w-3/4",
        "",
      )}
    >
      {/* <Accordion
        type="single"
        collapsible
        className={cn(`h-[calc(100vh-300px)] space-y-2 overflow-auto`)}
      >
        {isFetching ? (
          <div className="flex h-full w-full items-center justify-center">
            <p>Loading...</p>
          </div>
        ) : (
          roomTypes?.map((roomType: any, i: number) => {
            if (roomType.Rooms[0].count <= 0) {
              return null;
            }
            return (
              <>
                <AccordionItem
                  disabled={roomType.Rooms[0].count <= 0}
                  value={`${i}`}
                  onClick={() => setSelectedRoom(roomType)}
                  className={cn(
                    `overflow-hidden rounded-xl py-0 border-2 border-red-500`,
                    selectedRoom === roomType && "border-4 border-cstm-secondary",
                  )}
                >
                  <AccordionTrigger className={cn("w-full")}>
                    <Image
                      className={cn(
                        "w-2/4 transition-all duration-300",
                        "sm:w-2/4",
                        "md:w-2/5",
                        "lg:w-2/6",
                      )}
                      src={`https://placehold.co/150x75/png`}
                      alt={roomType.Name}
                      priority={true}
                      width={200}
                      height={300}
                      sizes="100vw"
                      style={{
                        objectFit: "cover",
                        height: "100%",
                      }}
                    />
                    <h1 className="w-auto text-start font-bold">
                      {roomType.Name}
                    </h1>
                  </AccordionTrigger>
                  <AccordionContent className="w-full p-4">
                    <div>{parse(roomType.Description)}</div>
                    <div className="grid w-1/2 grid-cols-2 gap-2">
                      <h1>Bedtype:</h1>
                      <p>{roomType.BedTypes.TypeName}</p>
                      <h1>Max Adult Count:</h1>
                      <p>{roomType.MaxAdult}</p>
                      <h1>Max Child Count:</h1>
                      <p>{roomType.MaxChild}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
              </>
            );
          })
        )}
      </Accordion> */}
      {availableRoomsLoading ? (
        <div className="flex flex-col items-center justify-center">
          <Loader className="animate-spin" />
          <p>Loading...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <p className="text-xl font-bold text-cstm-secondary">
            Available Rooms
          </p>
          <div className="flex gap-4">
            {/* <CalendarIcon size={20} color="black"></CalendarIcon> */}
            <p className="text-black/[.70]">
              <span className="font-semibold text-cstm-primary">
                {formatDate(checkInRange.from, "MMMM dd, yyyy")}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-cstm-primary">
                {formatDate(checkInRange.to, "MMMM dd, yyyy")}
              </span>
            </p>
          </div>
          <p className="text-black/[.70]">
            Select your preferred room type before proceeding.
          </p>
          <p className="text-sm text-black/[.60]">
            Room Availability is subject to change due to various factors, such
            as new bookings, updates to room inventory, and customer
            cancellations.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            {availableRooms?.map((roomType: any, i: number) => {
              if (roomType.AvailableRooms > 0) {
                let price = undefined;
                if (!roomRatesFetching && Array.isArray(roomRates)) {
                  if (isString(roomRates)) {
                    price = undefined;
                  } else {
                    price = roomRates?.find(
                      (rate: any) => rate.RoomTypeId === roomType.Id,
                    )?.BaseRoomRate;
                  }
                }
                return (
                  <RoomCard
                    tabindex={0}
                    key={i}
                    onClick={() => changeSelectedRoom(roomType, false)}
                    roomTitle={roomType.Name}
                    bedType={roomType.BedType}
                    adultCount={roomType.MaxAdult}
                    childCount={roomType.MaxChild}
                    roomDesc={roomType.Description}
                    price={price}
                    selectedType={selectedRoom.Name}
                    disabled={false}
                    availRooms={roomType.AvailableRooms}
                    images={roomType.Images}
                  ></RoomCard>
                );
              }

              // Available Rooms Only
              // if (roomType.Rooms[0].count <= 0) {
              //   return <RoomCard tabindex={0} key={i} onClick={() => changeSelectedRoom(roomType, true)} roomTitle={roomType.Name} bedType={roomType.BedTypes.TypeName} adultCount={roomType.MaxAdult} childCount={roomType.MaxChild} roomDesc={roomType.Description} price={price} selectedType={selectedRoom.Name} disabled={true} images={roomType.Images}></RoomCard>;
              // }

              // No Filter
              // return (
              //   <RoomCard tabindex={0} key={i} onClick={() => changeSelectedRoom(roomType, false)} roomTitle={roomType.Name} bedType={roomType.BedTypes.TypeName} adultCount={roomType.MaxAdult} childCount={roomType.MaxChild} roomDesc={roomType.Description} price={price} selectedType={selectedRoom.Name} disabled={false} availRooms={roomType.Rooms[0].count} images={roomType.Images} ></RoomCard>
              // )
            })}
          </div>
        </div>
      )}

      <Form {...form}>
        <form
          ref={formRef}
          id="bookingForm"
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        ></form>
      </Form>
      <div className={cn("mt-4 flex justify-center gap-4", "")}>
        <Button
          disabled={pageState === 0}
          variant={"destructive"}
          onClick={() => {
            console.log(pageState);
            goPrevPage();
          }}
        >
          Back
        </Button>
        <Button
          disabled={selectedRoom === 0}
          className="bg-cstm-primary"
          type="submit"
          form="bookingForm"
          onClick={() => {
            form.trigger();
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
/* ============================================================== 3 */
function SelectRoomRateForm({
  formRef,
}: {
  formRef: React.RefObject<HTMLFormElement>;
}) {
  const {
    pageState,
    goNextPage,
    goPrevPage,
    setExtraAdult,
    setExtraChild,
    adultGuests,
    setAdultGuests,
    childGuests,
    setChildGuests,
    selectedRoom,
    setSelectedRoom,
    selectedRoomRate,
    setSelectedRoomRate,
    promoCode,
    promoDetails,
    goToBookingDate,
    setInitialBill,
  } = useBookingStore();

  const { data: roomRates, isFetching } = useQuery({
    queryKey: ["roomRates", selectedRoom.Id, promoCode],
    queryFn: async () => {
      if (promoCode) {
        const { success, res } = await getRoomsTypOptions();
        const { success: roomRateSuccess, res: roomRateRes } =
          await getPromoRoomRate(promoCode);
        if (!success) throw new Error();

        setSelectedRoom(
          res?.find((type: any) => type.Id === promoDetails.RoomTypeId),
        );
        return roomRateRes;
      } else {
        const { success, res } = await getCurrentRoomTypeRate(selectedRoom.Id);
        if (!success) throw new Error();
        return res;
      }
    },
  });

  const {
    data: originalRate,
    isLoading: originalRateLoading,
    error: originalRateError,
  } = useQuery({
    enabled: promoCode.length > 0,
    queryKey: ["originalRate", selectedRoom.Id],
    queryFn: async () => {
      const { success, res } = await getCurrentRoomTypeRate(selectedRoom.Id);
      if (!success) throw new Error();
      return res;
    },
  });

  const {
    data: roomAmenities,
    isLoading: roomAmenitiesLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["roomAmenities", selectedRoom.Id],
    queryFn: async () => {
      console.log(selectedRoom);
      const data = await getRoomAmenities(selectedRoom.Id);
      if (isError) throw new Error(error.message);
      return data;
    },
  });

  const formSchema = z.object({
    extraAdultCount: z.string().default("0"),
    extraChildCount: z.string().default("0"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    /* Add Value to a Global State */
    console.log(values);
    setSelectedRoomRate(roomRates);
    setExtraAdult(parseInt(values.extraAdultCount));
    setExtraChild(parseInt(values.extraChildCount));
    goNextPage();
  }

  return (
    <div
      className={cn(
        "m-4 gap-2 space-y-4 rounded-sm xl:mx-auto xl:w-3/4 2xl:w-2/3",
      )}
    >
      {/* <Card
        className={cn("flex flex-col-reverse overflow-hidden", "md:flex-row")}
      >
        <div
          className={cn(
            "flex w-full flex-col gap-1 bg-cstm-primary p-4",
            "md:w-3/5",
            "lg:w-2/5",
          )}
        >
          <h1 className="text-xl font-semibold">Base Rate</h1>
          <p className="">₱ {roomRates?.BaseRoomRate} per night</p>
          <p>₱ {roomRates?.ExtraAdultRate} Extra Adult Charge per Night</p>
          <p>₱ {roomRates?.ExtraChildRate} Extra Adult Charge per Night</p>
          <h1 className="text-xl font-semibold">Weekend Rate</h1>
          <p className="">₱ {roomRates?.WeekendRoomRate} per night</p>
          <p>
            ₱ {roomRates?.WeekendExtraAdultRate} Extra Adult Charge per Night
          </p>
          <p>
            ₱ {roomRates?.WeekendExtraChildRate} Extra Adult Charge per Night
          </p>
          <p className="font-semibold">Inclusion</p>
          <div className="grid grid-cols-3 grid-rows-2">
            <p className="col-span-2 w-fit">Max adult count</p>
            <p>{selectedRoom?.MaxAdult}</p>
            <p className="col-span-2 w-fit">Max child count</p>
            <p>{selectedRoom?.MaxChild}</p>
          </div>
          <p className="font-base text-xs italic">
            If the number of persons exceeds the inclusion limit, it is treated
            as an additional person
          </p>
          <Form {...form}>
            <form
              ref={formRef}
              id="bookingForm"
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex h-full w-full flex-row items-center gap-4"
            >
              <div className="flex w-full flex-row gap-2">
                <FormField
                  name="extraAdultCount"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <FormLabel className="">Extra Adult Count</FormLabel>
                      <FormControl>
                        <Input placeholder="Extra Adult" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name="extraChildCount"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <FormLabel className="">Extra Child Count</FormLabel>
                      <FormControl>
                        <Input placeholder="Extra Child" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>
        <div className={cn("border-md w-full", "lg:w-3/5")}>
          <Image
            src={`https://placehold.co/200x100/png`}
            alt={"Room Image"}
            priority={true}
            width={200}
            height={200}
            style={{
              objectFit: "cover",
              height: "100%",
              width: "100%",
            }}
          />
        </div>
      </Card> */}
      {!isFetching &&
      !roomAmenitiesLoading &&
      !originalRateLoading &&
      roomAmenities ? (
        <RoomRatesCard
          roomType={selectedRoom}
          roomRate={roomRates}
          roomAmenities={roomAmenities}
          roomRateOrig={originalRate}
        ></RoomRatesCard>
      ) : (
        <Loader2 size={40} className="mx-auto animate-spin" color="gray" />
      )}
      <div className={cn("mt-4 flex justify-center gap-4", "")}>
        <Button
          disabled={pageState === 0}
          variant={"destructive"}
          onClick={() => {
            console.log(pageState);
            setInitialBill(0);
            if (promoCode) {
              goToBookingDate();
            } else {
              goPrevPage();
            }
          }}
        >
          Back
        </Button>
        <Button
          className="bg-cstm-primary"
          type="submit"
          form="bookingForm"
          onClick={() => {
            setSelectedRoomRate(roomRates);
            if (adultGuests > selectedRoomRate.MaxAdult) {
              setExtraAdult(adultGuests - selectedRoomRate.MaxAdult);
            }
            if (childGuests > selectedRoomRate.MaxChild) {
              setExtraChild(childGuests - selectedRoomRate.MaxChild);
            }

            goNextPage();
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
/* ============================================================== 4 */
function CustomerDetailsForm({
  formRef,
}: {
  formRef: React.RefObject<HTMLFormElement>;
}) {
  const {
    pageState,
    goNextPage,
    goPrevPage,
    checkInRange,
    promoCode,
    selectedRoomRate,
    extraAdult,
    extraChild,
    setInitialBill,
    setFirstName,
    setLastName,
    setBirthDate,
    setNationality,
    setEmail,
    setContactNumber,
    setCountry,
    setRequest,
    setAddress1,
    setAddress2,
    setCity,
    setZipCode,
    firstName,
    lastName,
    birthDate,
    nationality,
    email,
    contactNumber,
    country,
    request,
    numberOfRooms,
    setDateDetails,
    initialBill,
    setToSPrivacyModalState,
    setAppliedDiscount,
    appliedDiscount,
    adultGuests,
    childGuests,
    address1,
    address2,
    city,
    zipCode,
    province,
    setProvince,
  } = useBookingStore();

  const [discountLoading, setDiscountLoading] = useState(false);

  const formSchema = z
    .object({
      firstName: z.string().min(1, { message: "Please enter your first name" }),
      lastName: z.string().min(1, { message: "Please enter your last name" }),
      birthDate: z.date().refine((data) => data < new Date(), {
        message: "Please enter a valid date",
      }),
      country: z.string().min(1, { message: "Please enter your country" }),
      email: z.string().email({ message: "Please enter a valid email" }),
      confirmEmail: z.string().email({ message: "Please enter a valid email" }),
      contactNumber: z.coerce
        .string()
        .regex(/^\d+$/, { message: "Number can only contain digits." })
        .min(6, { message: "Number must contain at least 6 numbers." })
        .max(11, { message: "Number must contain at most 11 numbers." }),
      request: z.string(),
      address1: z.string(),
      address2: z.string().optional(),
      city: z.string().min(1, { message: "Please enter a city" }),
      province: z.string().min(1, { message: "Please enter a province" }),
      zipCode: z.coerce.string().min(1, { message: "Please enter a zip code" }),
      termsAndCondition: z
        .boolean()
        .default(false)
        .refine((val) => val, {
          message: "Please accept the terms and conditions",
        }),
      notForBooker: z.boolean().default(false),
      voucherCode: z.string().optional(),
    })
    .refine((data) => data.email === data.confirmEmail, {
      path: ["confirmEmail"],
      message: "Emails do not match",
    });
  const { weekdayDays, weekendDays, totalDays } = dateAnalysis(
    checkInRange.from,
    checkInRange.to,
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: firstName,
      lastName: lastName,
      birthDate: birthDate,
      country: country,
      request: request,
      email: email,
      confirmEmail: email,
      contactNumber: contactNumber,
      termsAndCondition: false,
      notForBooker: false,
      voucherCode: appliedDiscount.code || "",
      address1: address1,
      address2: address2,
      city: city,
      province: province,
      zipCode: zipCode,
    },
  });

  async function checkVoucher(voucherCode: string) {
    if (voucherCode == "") {
      form.setError("voucherCode", { message: "Please enter a voucher code." });
      form.clearErrors("voucherCode");
      return;
    } else {
      setDiscountLoading(true);
      setAppliedDiscount({} as any);
      const data = await checkDiscount(voucherCode, {
        roomTypeId: selectedRoomRate.RoomTypeId,
        startDate: checkInRange.from,
        endDate: checkInRange.to,
        nights: totalDays,
        bill: initialBill,
      });

      if (data.success) {
        setAppliedDiscount({
          id: data.res?.Id,
          name: data.res?.DiscountName,
          code: data.res?.DiscountCode,
          type: data.res?.DiscountType,
          value: data.res?.DiscountValue,
        });
        form.clearErrors("voucherCode");
      }
      if (!data.success) {
        form.setError("voucherCode", { message: data.message });
      }
      console.log(data);
      setDiscountLoading(false);
    }
  }

  function removeDiscount() {
    setAppliedDiscount({} as any);
    form.clearErrors("voucherCode");
    form.setValue("voucherCode", "");
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    setInitialBill(initialBill);
    console.log(values);
    setFirstName(values.firstName);
    setLastName(values.lastName);
    setBirthDate(values.birthDate);
    setNationality("");
    setEmail(values.email);
    setContactNumber(values.contactNumber);
    setCountry(values.country);
    setRequest(values.request);
    setAddress1(values.address1);
    setAddress2(values.address2 || "");
    setCity(values.city);
    setZipCode(values.zipCode);
    setProvince(values.province);
    setDateDetails({ totalDays });
    goNextPage();
  }

  useEffect(() => {
    console.log(appliedDiscount);
  }, [appliedDiscount]);

  return (
    <div
      className={cn(
        "mx-auto w-11/12 space-y-4 overflow-hidden rounded-sm",
        "sm:w-9/12",
        "md:w-10/12",
        "xl:w-3/4",
        "2xl:w-1/2",
      )}
    >
      <ToSPrivacyModal></ToSPrivacyModal>
      <Form {...form}>
        <form
          ref={formRef}
          id="bookingForm"
          onSubmit={form.handleSubmit(onSubmit)}
          className="relative flex min-h-screen flex-row gap-4"
        >
          <Card className="w-2/3 overflow-hidden">
            <div className={cn("flex w-full flex-col")}>
              <div className="flex flex-col gap-4 p-4">
                <p className="text-xl font-bold">Contact Information</p>
                <div className={cn("grid w-full grid-cols-4 gap-x-4 gap-y-6")}>
                  <FormField
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className={cn("col-span-4", "sm:col-span-2")}>
                        <div className="flex items-center gap-2">
                          <FormLabel
                            onClick={() =>
                              console.log(
                                `Extra Adult: ${extraAdult}`,
                                `Extra Child: ${extraChild}`,
                              )
                            }
                          >
                            First Name
                          </FormLabel>
                          <FormMessage className="text-xs" />
                        </div>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className={cn("col-span-4", "sm:col-span-2")}>
                        <div className="flex items-center gap-2">
                          <FormLabel>Last Name</FormLabel>
                          <FormMessage className="text-xs" />
                        </div>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem className={cn("col-span-4")}>
                        <div className="flex items-center gap-2">
                          <FormLabel>Birth Date</FormLabel>
                          <FormMessage className="text-xs" />
                        </div>
                        <FormControl>
                          <DatePicker
                            date={field.value}
                            setDate={field.onChange}
                          />
                          {/* <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date("1900-01-01")
                                }
                                captionLayout="dropdown"
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover> */}
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {/* <FormField
                    name="nationality"
                    render={({ field }) => (
                      <FormItem className={cn("col-span-4", "sm:col-span-2")}>
                        <div className="flex items-center gap-2">
                          <FormLabel>Nationality</FormLabel>
                          <FormMessage className="text-xs" />
                        </div>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  /> */}
                  <FormField
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem className={cn("col-span-4")}>
                        <div className="flex items-center gap-2">
                          <FormLabel>Contact Number</FormLabel>
                          <FormMessage className="text-xs" />
                        </div>
                        <FormControl>
                          <Input {...field} type="number" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="email"
                    render={({ field }) => (
                      <FormItem className={cn("col-span-4")}>
                        <div className="flex items-center gap-2">
                          <FormLabel>Email</FormLabel>
                          <FormMessage className="text-xs" />
                        </div>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="confirmEmail"
                    render={({ field }) => (
                      <FormItem className={cn("col-span-4")}>
                        <div className="flex items-center gap-2">
                          <FormLabel>Confirm Email</FormLabel>
                          <FormMessage className="text-xs" />
                        </div>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <p className="text-xl font-bold">Billing Address</p>
                <div className={cn("grid w-full grid-cols-4 gap-x-4 gap-y-6")}>
                  <FormField
                    name="country"
                    render={({ field }) => (
                      <FormItem className={cn("col-span-4", "sm:col-span-4")}>
                        <div className="flex items-center gap-2">
                          <FormLabel>Country</FormLabel>
                          <FormMessage className="text-xs" />
                        </div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value
                                  ? countries.find(
                                      (country) => country.name === field.value,
                                    )?.name
                                  : "Select Country"}
                                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput
                                placeholder="Search country..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>No framework found.</CommandEmpty>
                                <CommandGroup>
                                  {countries.map((country) => (
                                    <CommandItem
                                      value={country.name}
                                      key={country.name}
                                      onSelect={() => {
                                        form.setValue("country", country.name);
                                      }}
                                    >
                                      {country.name}
                                      <CheckIcon
                                        className={cn(
                                          "ml-auto h-4 w-4",
                                          country.name === field.value
                                            ? "opacity-100"
                                            : "opacity-0",
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="address1"
                    render={({ field }) => (
                      <FormItem className={cn("col-span-4", "sm:col-span-2")}>
                        <div className="flex items-center gap-2">
                          <FormLabel
                            onClick={() =>
                              console.log(
                                `Extra Adult: ${extraAdult}`,
                                `Extra Child: ${extraChild}`,
                              )
                            }
                          >
                            Address 1
                          </FormLabel>
                          <FormMessage className="text-xs" />
                        </div>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="address2"
                    render={({ field }) => (
                      <FormItem className={cn("col-span-4", "sm:col-span-2")}>
                        <div className="flex items-center gap-2">
                          <FormLabel
                            onClick={() =>
                              console.log(
                                `Extra Adult: ${extraAdult}`,
                                `Extra Child: ${extraChild}`,
                              )
                            }
                          >
                            Address 2
                          </FormLabel>
                          <FormMessage className="text-xs" />
                        </div>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="city"
                    render={({ field }) => (
                      <FormItem className={cn("col-span-4", "sm:col-span-2")}>
                        <div className="flex items-center gap-2">
                          <FormLabel
                            onClick={() =>
                              console.log(
                                `Extra Adult: ${extraAdult}`,
                                `Extra Child: ${extraChild}`,
                              )
                            }
                          >
                            City
                          </FormLabel>
                          <FormMessage className="text-xs" />
                        </div>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="province"
                    render={({ field }) => (
                      <FormItem className={cn("col-span-4", "sm:col-span-2")}>
                        <div className="flex items-center gap-2">
                          <FormLabel>Province</FormLabel>
                          <FormMessage className="text-xs" />
                        </div>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem className={cn("col-span-4", "sm:col-span-2")}>
                        <div className="flex items-center gap-2">
                          <FormLabel>Postal / ZIP Code</FormLabel>
                          <FormMessage className="text-xs" />
                        </div>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="request"
                    render={({ field }) => (
                      <FormItem className={cn("col-span-4 row-span-2")}>
                        <div className="flex items-center gap-2">
                          <FormLabel>Special Request</FormLabel>
                          <FormMessage className="text-xs" />
                        </div>
                        <FormControl>
                          <Textarea {...field} className="resize-none" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="col-span-4 my-2 w-full">
                    <hr className="w-full" />
                  </div>
                  <FormField
                    name="voucherCode"
                    render={({ field }) => (
                      <FormItem className={cn("col-span-4")}>
                        <div className="flex items-center gap-2">
                          <FormLabel>Enter a voucher code</FormLabel>
                        </div>
                        <FormControl>
                          <div className="flex gap-4">
                            <Input
                              {...field}
                              className="w-3/4"
                              disabled={discountLoading}
                            />
                            <Button
                              className={`w-1/4 ${appliedDiscount.code ? "bg-red-500" : "bg-cstm-primary"} text-white`}
                              type="button"
                              disabled={discountLoading}
                              onClick={() =>
                                appliedDiscount.code
                                  ? removeDiscount()
                                  : checkVoucher(field.value)
                              }
                            >
                              {discountLoading ? (
                                <Loader2
                                  className="animate-spin"
                                  color="currentColor"
                                />
                              ) : appliedDiscount.code ? (
                                "Remove"
                              ) : (
                                "Apply"
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </Card>
          <div className="w-full lg:w-1/3">
            <div className="sticky">
              <Card className="">
                <div
                  className={cn(
                    "w-full space-y-4 rounded-md bg-cstm-secondary p-4",
                  )}
                >
                  <h1 className="text-xl font-bold text-white">
                    Booking Details
                  </h1>
                  {/* <div className="grid-row-2 grid grid-cols-3 items-center gap-y-2">
                      <h1 className="text-white font-medium">Check-In</h1>
                      <p className="col-span-2">
                        <span className="bg-cstm-primary rounded-lg p-1 px-4 text-white">{format(new Date(checkInRange.from), "PPP")}</span>
                      </p>
                      <h1 className="text-white font-medium">Check-Out</h1>
                      <p className="col-span-2">
                        <span className="bg-cstm-primary rounded-lg p-1 px-4 text-white">{format(new Date(checkInRange.to), "PPP")}</span>
                      </p>
                    </div> */}
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col flex-wrap gap-2">
                      <p className="text-white">Check In</p>
                      <div>
                        <span className="rounded-lg bg-cstm-primary p-1 px-4 text-white">
                          {format(new Date(checkInRange.from), "PPP")}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col flex-wrap gap-2">
                      <p className="text-white">Check Out</p>
                      <div>
                        <span className="rounded-lg bg-cstm-primary p-1 px-4 text-white">
                          {format(new Date(checkInRange.to), "PPP")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-8 text-xl font-bold text-white">
                    Charge Summary
                  </p>
                  {/* <h1 className="text-xl font-bold text-white">Charge Summary</h1>
                    <div className="grid-row-4 grid grid-cols-3 items-center gap-y-2">
                      <h1 className="font-medium">Initial Bill</h1>
                      <p className="col-span-2 bg-cstm-secondary p-1 px-4 text-white">
                        P {initialBill}
                      </p>
                      <h1 className="font-medium">VAT</h1>
                      <p className="col-span-2 bg-cstm-secondary p-1 px-4 text-white">
                        P {initialBill * 0.12}
                      </p>
                      <h1 className="font-medium">Promo Code</h1>
                      <p className="col-span-2 bg-cstm-secondary p-1 px-4 text-white">
                        {promoCode || "None"}
                      </p>
                      <h1 className="font-medium">Total</h1>
                      <p className="col-span-2 bg-cstm-secondary p-1 px-4 text-white">
                        P {commafy(initialBill + initialBill * 0.12)}
                      </p>
                    </div> */}
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between">
                      <p className="text-white/[.70]">Initial Bill</p>
                      <p className="text-white">
                        ¥{formatCurrencyJP(initialBill)}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-white/[.70]">VAT</p>
                      <p className="text-white">
                        ¥{formatCurrencyJP(initialBill * 0.12)}
                      </p>
                    </div>
                    {promoCode && (
                      <div className="flex justify-between">
                        <p className="text-white/[.70]">Promo Code</p>
                        <p className="text-white">{promoCode || "None"}</p>
                      </div>
                    )}
                    {appliedDiscount.code && (
                      <div className="flex justify-between">
                        <p className="text-white/[.70]">Discount Code</p>
                        <div className="flex flex-col items-end">
                          <p className="font-bold text-green-500">
                            {appliedDiscount.type === "percentage"
                              ? `- ¥${formatCurrencyJP(getPercentage(initialBill + initialBill * 0.12, appliedDiscount.value))}`
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
                    <hr />
                    <div className="flex justify-between rounded-lg bg-cstm-primary p-5">
                      <p className="text-white/[.70]">TOTAL</p>
                      <div className="flex flex-col items-end">
                        <p className="text-2xl font-bold text-white">
                          ¥
                          {formatCurrencyJP(
                            initialBill +
                              initialBill * 0.12 -
                              ((appliedDiscount &&
                                (appliedDiscount.type === "percentage"
                                  ? ((initialBill + initialBill * 0.12) *
                                      appliedDiscount.value) /
                                    100
                                  : appliedDiscount.value)) ||
                                0),
                          )}
                        </p>
                        {appliedDiscount.id && (
                          <p className="text-lg font-bold text-white/[.50] line-through">
                            ¥
                            {formatCurrencyJP(initialBill + initialBill * 0.12)}
                          </p>
                        )}
                        <p className="text-sm italic text-white/[.70]">
                          Including taxes and fees.
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-center gap-4 rounded p-1">
                      <SiMastercard color="#5F7486" size={36}></SiMastercard>
                      <SiVisa color="#5F7486" size={36}></SiVisa>
                      <SiAmericanexpress
                        color="#5F7486"
                        size={36}
                      ></SiAmericanexpress>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <FormField
                      name="termsAndCondition"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="h-5 w-5 border-cstm-primary text-xs data-[state=checked]:bg-cstm-primary"
                            />
                          </FormControl>
                          <FormLabel className="m-0 text-xs text-white">
                            <FormMessage></FormMessage>I have read and agreed to
                            (name of hotel)'s{"  "}
                            <Button
                              type="button"
                              className="m-0 h-max p-0 text-cstm-primary"
                              variant="link"
                              onClick={() => {
                                setToSPrivacyModalState(true);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  setToSPrivacyModalState(true);
                                }
                              }}
                            >
                              Terms of Service
                            </Button>
                            {"  "}and{"  "}
                            <Button
                              type="button"
                              className="m-0 h-max p-0 text-cstm-primary"
                              variant="link"
                              onClick={() => {
                                setToSPrivacyModalState(true);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  setToSPrivacyModalState(true);
                                }
                              }}
                            >
                              Privacy Policy.
                            </Button>
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </Card>
            </div>
            <div>
              <Button
                type="button"
                onClick={() => {
                  form.setValue("firstName", "John");
                  form.setValue("lastName", "Doe");
                  form.setValue("birthDate", new Date("1998-01-01"));
                  form.setValue("country", "Philippines");
                  form.setValue("email", "jdoe@gmail.com");
                  form.setValue("confirmEmail", "jdoe@gmail.com");
                  form.setValue("contactNumber", "09123456789");
                  form.setValue("request", "Please provide extra towels.");
                  form.setValue("address1", "123 Main St.");
                  form.setValue("address2", "Brgy. 1");
                  form.setValue("city", "Manila");
                  form.setValue("province", "Metro Manila");
                  form.setValue("zipCode", "1000");
                }}
              >
                ADD DUMMY
              </Button>
            </div>
          </div>
        </form>
      </Form>

      <div className={cn("mt-4 flex justify-center gap-4", "")}>
        <Button
          disabled={pageState === 0}
          variant={"destructive"}
          onClick={() => {
            console.log(pageState);
            goPrevPage();
          }}
        >
          Back
        </Button>
        <Button
          className="bg-cstm-primary"
          type="submit"
          form="bookingForm"
          onClick={() => {
            form.trigger();
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
/* ============================================================== 5 */
function ConfirmForm({
  formRef,
}: {
  formRef: React.RefObject<HTMLFormElement>;
}) {
  const router = useRouter();
  const config = useConfig();
  const {
    goPrevPage,
    selectedRoomRate,
    firstName,
    lastName,
    birthDate,
    email,
    numberOfRooms,
    selectedRoom,
    dateDetails,
    initialBill,
    checkInRange,
    promoCode,
    extraAdult,
    extraChild,
    nationality,
    contactNumber,
    adultGuests,
    childGuests,
    referenceNumber,
    country,
    request,
    address1,
    address2,
    city,
    zipCode,
    province,
    resetStore,
    appliedDiscount,
    setPageState,
  } = useBookingStore();

  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    birthDate: z.date(),
    email: z.string(),
    numberOfRooms: z.number(),
    roomTypeId: z.number(),
    initialBill: z.number(),
    checkInDate: z.date(),
    checkOutDate: z.date(),
    extraAdult: z.number(),
    extraChild: z.number(),
    contactNumber: z.string(),
    roomRateId: z.number(),
    country: z.string(),
    request: z.string(),
    address1: z.string(),
    address2: z.string().nullable(),
    city: z.string(),
    province: z.string(),
    zipCode: z.string(),
    adultGuests: z.number(),
    childGuests: z.number(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      firstName,
      lastName,
      birthDate,
      email,
      numberOfRooms,
      roomTypeId: selectedRoomRate?.RoomTypeId,
      initialBill,
      checkInDate: checkInRange.from,
      checkOutDate: checkInRange.to,
      extraAdult,
      extraChild,
      contactNumber,
      roomRateId: selectedRoomRate.RoomRateID,
      country,
      request,
      address1,
      address2,
      city,
      province,
      zipCode,
      adultGuests,
      childGuests,
    },
  });

  function getAge(birthDate: Date) {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  }

  async function sendTestEmail() {
    const details = {
      reservationId: "1",
      bookingDate: new Date(),
      checkIn: new Date(checkInRange.from),
      checkOut: new Date(checkInRange.to),
      roomType: selectedRoom.Name,
      guestName: {
        firstName: capitalizeFirstLetter(firstName),
        lastName: capitalizeFirstLetter(lastName),
      },
      roomBill: initialBill,
      promoCode: "",
      promoCodeValue: "",
      discountCode: appliedDiscount.code || "",
      discountValue: appliedDiscount.value || 0,
      discountType: appliedDiscount.type || "",
    };

    sendEmail(
      "",
      `${config.CompanyName} <${config.CompanyEmail}>`,
      "Booking Confirmation",
      emailStringConfirmBooking(config, details),
    );
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    let deviceTypeId;
    const userAgent =
      navigator.userAgent || navigator.vendor || (window as any).opera;

    if (/windows phone/i.test(userAgent)) {
      deviceTypeId = 2;
    } else if (/android/i.test(userAgent)) {
      deviceTypeId = 3;
    } else if (
      /iPad|iPhone|iPod/.test(userAgent) &&
      !(window as any).MSStream
    ) {
      deviceTypeId = 4;
    } else if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent)) {
      deviceTypeId = 5;
    } else if (/Win32|Win64|Windows|WinCE/.test(userAgent)) {
      deviceTypeId = 1;
    } else {
      deviceTypeId = 6;
    }

    const { success, res } = await addOnlineReservation(
      capitalizeFirstLetter(values.firstName),
      capitalizeFirstLetter(values.lastName),
      values.birthDate,
      values.email,
      values.contactNumber,
      "",
      values.numberOfRooms,
      values.roomTypeId,
      new Date(convertToLocalUTCTime(values.checkInDate)),
      new Date(convertToLocalUTCTime(values.checkOutDate)),
      values.extraAdult,
      values.extraChild,
      values.roomRateId,
      deviceTypeId,
      capitalizeFirstLetter(values.country),
      values.request,
      appliedDiscount.id || null,
      values.address1,
      values.address2,
      values.city,
      values.province,
      values.zipCode,
      values.adultGuests,
      values.childGuests,
      1,
    );

    if (success) {
      const reservationData = await checkReservation(res.Id);

      const details = {
        reservationId: res.Id,
        bookingDate: new Date(reservationData.res.CreatedAt),
        checkIn: new Date(values.checkInDate),
        checkOut: new Date(values.checkOutDate),
        roomType: reservationData.res.TypeName,
        guestName: {
          firstName: capitalizeFirstLetter(values.firstName),
          lastName: capitalizeFirstLetter(values.lastName),
        },
        roomBill: initialBill,
        promoCode: "",
        promoCodeValue: "",
        discountCode: appliedDiscount.code || "",
        discountValue: appliedDiscount.value || 0,
        discountType: appliedDiscount.type || "",
      };

      sendEmail(
        values.email,
        `${config.CompanyName} <${config.CompanyEmail}>`,
        "Booking Confirmation",
        emailStringConfirmBooking(config, details),
      );
      setBookingSuccess(true);
      //setPageState(0);
      resetStore();
    } else {
      toast.error("Oops!", {
        description: "An error has occured. Please try again later.",
        closeButton: true,
        duration: 3500,
      });
    }
    setIsLoading(false);
  }

  if (bookingSuccess) {
    return <BookingSuccess />;
  } else {
    return (
      <div className="mx-auto px-3 lg:w-3/4 lg:px-0">
        <Form {...form}>
          <form id="bookingForm" onSubmit={form.handleSubmit(onSubmit)}></form>
        </Form>
        {/* <div className="grid-row-4 mx-auto grid grid-cols-2 gap-4 rounded-sm p-5 text-xs sm:text-sm md:text-base">
          <Card className="col-span-2 p-4">
            <p className="text-justify">
              After submiting this form the next step is to pay on the venue to
              finalize your booking.
            </p>
          </Card>
          <Card className="col-span-2 p-4">
            <h1 className="mb-2 border-b-2 pb-2 font-semibold">
              Payment Details
            </h1>
            <div className="flex flex-col gap-4">
              <div className="grid w-full grid-cols-2">
                <h1 className="font-semibold">Weekday Room Rate</h1>
                <p>P {selectedRoomRate?.BaseRoomRate}</p>
                <h1 className="font-semibold">Weekend Room Rate</h1>
                <p>P {selectedRoomRate?.WeekendRoomRate}</p>
              </div>
              <p className="text-justify">
                Once paid, please send us a copy of the scanned deposit slip via
                email or by calling us at Contact Number for verification purpose.
                Upon verifying your payment, a confirmation of reservation will be
                sent to your email. Otherwise; if we don’t receive any payments
                from you, your reservation will be cancelled in our system.
              </p>
              <p className="text-justify">
                If you have any concerns please don’t hesitate to contact us.{" "}
              </p>
              <p>Thank you!</p>
            </div>
          </Card>
          <Card className="col-span-2 p-4 sm:col-span-1">
            <h1 className="text-lg mb-2 border-b-2 pb-2 font-semibold">
              Guest Details
            </h1>
            <div className="grid grid-cols-3 sm:w-2/3">
              <h1 className="font-semibold">Name</h1>
              <p className="col-span-2">
                {capitalizeFirstLetter(firstName)}{" "}
                {capitalizeFirstLetter(lastName)}
              </p>
              <h1 className="font-semibold">Age</h1>
              <p className="col-span-2">{getAge(new Date(birthDate))}</p>
              <h1 className="font-semibold">Email</h1>
              <p className="col-span-2">{email}</p>
            </div>
          </Card>
          <Card className="col-span-2 p-4 sm:col-span-1">
            <h1 className="text- mb-2 border-b-2 pb-2 font-semibold">
              Room Details
            </h1>
            <div className="grid grid-cols-2 sm:w-2/3">
              <h1 className="font-semibold">Room Type</h1>
              <p>{selectedRoom.Name}</p>
              <h1 className="font-semibold">Max Adult</h1>
              <p>{selectedRoom?.MaxAdult}</p>
              <h1 className="font-semibold">Max Child</h1>
              <p>{selectedRoom?.MaxChild}</p>
            </div>
          </Card>
          <Card className="col-span-2 p-4">
            <h1 className="mb-2 border-b-2 pb-2 font-semibold">
              Booking Details
            </h1>
            <div className="grid w-full grid-cols-2 [&>*]:border-b">
              <h1 className="font-semibold">Hotel Name</h1>
              <p>ABC Hotel</p>
              <h1 className="font-semibold">Transaction Date</h1>
              <p>
                {new Date().toLocaleDateString("en", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <h1 className="font-semibold">Reference Number</h1>
              <p>FB22D1SZDS</p>
              <h1 className="font-semibold">Number of Rooms</h1>
              <p>{numberOfRooms} Room(s)</p>
              <h1 className="font-semibold">Number of Nights</h1>
              <p>{dateDetails.totalDays} Night(s)</p>
              <h1 className="font-semibold">Extra Adult Count</h1>
              <p>{extraAdult}</p>
              <h1 className="font-semibold">Extra Child Count</h1>
              <p>{extraChild}</p>
              <h1 className="font-semibold">Initial Bill</h1>
              <p>P {commafy(initialBill)}</p>
            </div>
          </Card>
        </div> */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex w-full flex-col gap-4 rounded-lg bg-cstm-secondary p-5 md:w-2/3">
              <p className="text-xl font-bold text-white">
                Payment Instructions
              </p>
              <div className="flex flex-col justify-between rounded-lg bg-cstm-primary p-5 md:flex-row">
                <p className="text-white/[.70]">TOTAL</p>
                <div className="flex flex-col items-start md:items-end">
                  <p className="text-2xl font-bold text-white">
                    ¥
                    {formatCurrencyJP(
                      initialBill +
                        initialBill * 0.12 -
                        ((appliedDiscount &&
                          (appliedDiscount.type === "percentage"
                            ? ((initialBill + initialBill * 0.12) *
                                appliedDiscount.value) /
                              100
                            : appliedDiscount.value)) ||
                          0),
                    )}
                  </p>
                  {appliedDiscount.id && (
                    <p className="text-lg font-bold text-white/[.50] line-through">
                      ¥{formatCurrencyJP(initialBill + initialBill * 0.12)}
                    </p>
                  )}
                  <p className="text-sm italic text-white/[.70]">
                    Including fees and taxes.
                  </p>
                </div>
              </div>
              {/* <p className="text-white">You may finish your booking, but see to it that you pay the amount specified within the next 24 hours.</p>
                    <p className="text-white/[.70]">Once paid, please send us a copy of the scanned deposit slip via email or by calling us at Contact Number for verification purpose. Upon verifying your payment, a confirmation of reservation will be sent to your email. </p> */}
              <div>{parse(config?.PaymentInstructions)}</div>
            </div>

            <div className="flex w-full flex-col gap-4 rounded-lg bg-cstm-secondary p-5 md:w-1/3">
              <p className="text-xl font-bold text-white">Customer Details</p>
              <div className="flex flex-col items-center gap-4 text-white">
                <CircleUserRoundIcon
                  strokeWidth={1}
                  size={120}
                  color="white"
                ></CircleUserRoundIcon>
                <p className="text-lg font-bold">
                  <span className="rounded-3xl bg-cstm-primary p-3">
                    {firstName} {lastName}
                  </span>
                </p>
                <p>{email}</p>
                <p>{contactNumber}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex w-full flex-col gap-4 rounded-lg bg-cstm-secondary p-5 md:w-1/3">
              <p className="text-xl font-bold text-white">Room Details</p>
              <p className="text-lg font-bold text-white">
                {selectedRoom.Name}
              </p>
              {selectedRoom.Images && (
                <div className="relative h-[150px]">
                  <Image
                    className="rounded-md object-cover"
                    src={selectedRoom.Images[0]}
                    alt="Beach"
                    fill
                  />
                </div>
              )}
              <div className="flex flex-col items-start gap-4 transition">
                <div className={`flex items-center gap-2 text-cstm-primary`}>
                  <BedDoubleIcon size={16} className="transition" />
                  <p className="transition">{selectedRoom.BedType} </p>
                </div>
                <div className={`flex items-center gap-2 text-cstm-primary`}>
                  <CircleUserRoundIcon size={16} className="transition" />
                  <p className="transition">
                    {selectedRoom.MaxAdult > 1
                      ? `${selectedRoom.MaxAdult} Adults`
                      : `${selectedRoom.MaxAdult} Adult`}{" "}
                  </p>
                </div>
                <div className={`flex items-center gap-2 text-cstm-primary`}>
                  <BabyIcon size={16} className="transition" />
                  <p className="max-h-[100px] transition">
                    {selectedRoom.MaxChild > 1
                      ? `${selectedRoom.MaxChild} Children`
                      : `${selectedRoom.MaxChild} Child`}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full rounded-lg bg-cstm-secondary p-5 md:w-2/3">
              <p className="mb-8 text-xl font-bold text-white">
                Reservation Details
              </p>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-12">
                <div className="flex flex-col">
                  <p className="font-bold text-cstm-primary">
                    {new Date().toLocaleDateString()}
                  </p>
                  <p className="text-white/[.70]">Transaction Date</p>
                </div>
                <div className="flex flex-col">
                  <p className="font-bold text-cstm-primary">
                    {adultGuests + childGuests} Guests
                  </p>
                  <p className="text-white/[.70]">Expected Guests</p>
                </div>
                <div className="flex flex-col">
                  <p className="font-bold text-cstm-primary">
                    {checkInRange.from.toLocaleDateString()}
                  </p>
                  <p className="text-white/[.70]">Check-In Date</p>
                </div>
                <div className="flex flex-col">
                  <p className="font-bold text-cstm-primary">
                    {checkInRange.to.toLocaleDateString()}
                  </p>
                  <p className="text-white/[.70]">Check-Out Date</p>
                </div>
                <div className="flex flex-col">
                  <p className="font-bold text-cstm-primary">
                    {selectedRoom.Name}
                  </p>
                  <p className="text-white/[.70]">Booked Room</p>
                </div>
              </div>
              <div className="mt-4 flex flex-col justify-center self-end rounded-lg bg-cstm-primary p-3">
                <p className="font-bold text-white">Questions?</p>
                <p className="text-white/[.70]">
                  You may reach us through our contact numbers and email below:
                </p>
                <>
                  {config.CompanyContact && (
                    <div className="mt-4 flex gap-4">
                      <PhoneIcon size={16} className="text-white" />
                      <p className="text-white/[.70]">
                        {config.CompanyContact}
                      </p>
                    </div>
                  )}
                  {config.CompanyEmail && (
                    <div className="flex gap-4">
                      <AtSignIcon size={16} className="text-white" />
                      <p className="text-wrap text-white/[.70]">
                        {config.CompanyEmail}
                      </p>
                    </div>
                  )}
                </>
                {/* <div className="flex gap-4 mt-4"> 
                            <PhoneIcon size={16} className="text-white"/>
                            <p className="text-white/[.70]">(123) 456-7890</p>
                        </div>
                        <div className="flex gap-4"> 
                            <AtSignIcon size={16} className="text-white"/>
                            <p className="text-white/[.70] text-wrap">service@abchotel.com</p>
                        </div> */}
              </div>
            </div>
          </div>
        </div>
        <div className={cn("mt-4 flex justify-center gap-4", "")}>
          <Button
            variant={"destructive"}
            onClick={() => {
              goPrevPage();
            }}
            disabled={isLoading}
          >
            Back
          </Button>
          <Button
            className="bg-cstm-primary"
            type="submit"
            form="bookingForm"
            disabled={isLoading}
          >
            Finish Booking
          </Button>
        </div>
      </div>
    );
  }
}
