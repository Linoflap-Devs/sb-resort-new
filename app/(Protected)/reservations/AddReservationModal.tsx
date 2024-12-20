"use client"
import { BabyIcon, CalendarIcon, CheckIcon, ChevronsUpDownIcon, CircleAlertIcon, CircleUserIcon, Loader2 } from "lucide-react";
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
import { capitalizeFirstLetter, computeInitialBooking, convertToLocalUTCTime, findWeekdaysInRange, formatCurrencyJP } from "@/utils/Helpers";
import { countries } from "@/data/countries";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { RoomRate } from "@/types";
import { DatePicker } from "@/components/ui/calendar2";

export default function AddReservationModal() {

    const { addReservationModalState, setAddReservationModalState, availableRoomsQuery, roomTypesQuery, roomRatesQuery, reservationQuery } = useGlobalStore();
    const [childCapacity, setChildCapacity] = useState(0);
    const [adultCapacity, setAdultCapacity] = useState(0);
    const [extraChild, setExtraChild] = useState(0);
    const [extraAdult, setExtraAdult] = useState(0);
    const [days, setDays] = useState<{weekends: number, weekdays: number}>({weekends: 0, weekdays: 0});
    const [roomRate, setRoomRate] = useState<RoomRate>({} as RoomRate);
    const [submissionLoading, setSubmissionLoading] = useState(false);

    const formSchema = z.object({
        dateRange: z.object({
                from: z.date(),
                to: z.date()
            },
            {
                message: "Please select a date range"
            }).
            default({from: new Date(), to: addDays(new Date(), 1)}).
            refine((data) => data.from < data.to, {
                path: ["dateRange"],
                message: "Check-In date must be before Check-Out date",
            }),
        roomType: z.string().min(1, {message: "Please select a room type."}),
        adultGuests: z.coerce.number().min(1, {message: "Adults must be at least 1."}),
        childGuests: z.coerce.number().min(0),
        extraAdult: z.coerce.number().min(0),
        extraChild: z.coerce.number().min(0),
        request: z.string().optional(),
        firstName: z.string().min(1, {message: "First name must contain at least 1 character."}),
        lastName: z.string().min(1, {message: "First name must contain at least 1 character."}),
        birthday: z.date(),
        email: z.string().email().min(1, {message: "Invalid email format."}),
        phoneNumber: z.string().min(9, {message: "Phone number must contain at least 9 digits."}).max(11, {message: "Phone number must contain at most 11 digits."}),
        country: z.string(),
    
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            dateRange: {from: new Date(), to: addDays(new Date(), 1)},
            roomType: undefined,
            adultGuests: 0,
            childGuests: 0,
            extraAdult: 0,
            extraChild: 0,
            request: "",
            firstName: "",
            lastName: "",
            birthday: new Date("1990-01-01"),
            email: "",
            phoneNumber: "",
            country: "Philippines",
        }
    })

    const { data, isLoading, refetch } = availableRoomsQuery(form.getValues("dateRange").from, form.getValues("dateRange").to);
    const { data: roomTypeData, isLoading: roomTypeLoading, refetch: roomTypeRefetch } = roomTypesQuery()
    const { data: roomRateData, isLoading: roomRateLoading, refetch: roomRateRefetch } = roomRatesQuery();
    const { refetch: reservationRefetch } = reservationQuery();

    useEffect(() => {
        refetch()
        setDays(findWeekdaysInRange(form.getValues("dateRange").from, form.getValues("dateRange").to))
    }, [form.watch("dateRange")])  

    useEffect(() => {
        setAdultCapacity(roomTypeData?.find((room: any) => room.TypeName.toLowerCase() == form.getValues("roomType")?.toString().toLowerCase())?.MaxAdult)
        setChildCapacity(roomTypeData?.find((room: any) => room.TypeName.toLowerCase() == form.getValues("roomType")?.toString().toLowerCase())?.MaxChild)
    }, [form.watch("roomType"), roomTypeData])

    
    useEffect(() => {
        if(!roomRateLoading && roomRateData) {
            const rate = roomRateData?.find((rate: any) => rate.RoomType.toLowerCase() == form.getValues("roomType"))
            setRoomRate(rate)
        }
    }, [form.watch("roomType"), roomRateData])
    
    useEffect(() => {
        console.log(form.getValues("adultGuests"), adultCapacity)
        if(form.getValues("adultGuests") > adultCapacity) {
            setExtraAdult(form.getValues("adultGuests") - adultCapacity)
        }
        else {
            setExtraAdult(0)
        }
    },[form.watch("adultGuests"), adultCapacity])

    useEffect(() => {
        if(form.getValues("childGuests") > childCapacity) {
            setExtraChild(form.getValues("childGuests") - childCapacity)
        }
        else {
            setExtraChild(0)
        }
    }, [form.watch("childGuests"), childCapacity])

    useEffect(() => {
        console.log(form.getValues("country"))
        console.log(roomRateData)
        setRoomRate({
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
        });
    }, [])

    const addMutation = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            setSubmissionLoading(true)
            const res = await addOnlineReservation(
                        capitalizeFirstLetter(values.firstName),
                        capitalizeFirstLetter(values.lastName),
                        values.birthday,
                        values.email,
                        values.phoneNumber,
                        "",
                        1,
                        roomTypeData?.find((room: any) => room.TypeName.toLowerCase() == form.getValues("roomType")?.toString().toLowerCase())?.Id,
                        new Date(convertToLocalUTCTime(values.dateRange.from)),
                        new Date(convertToLocalUTCTime(values.dateRange.to)),
                        values.extraAdult,
                        values.extraChild,
                        roomRate.Id,
                        1,
                        values.country,
                        values.request || "",
                        null,
                        "",
                        "",
                        "",
                        "",
                        values.adultGuests,
                        values.childGuests
            )
            if(!res.success) throw new Error(res.res)
            return res.res
        },
        onSuccess(data, variables, context) {
            setSubmissionLoading(false)
            form.reset();
            setAddReservationModalState(false);
            reservationRefetch();
            toast.success("Success", {
                description: "Reservation added successfully.",
            })
        },
        onError(error, variables, context) {
            setSubmissionLoading(false)
            console.log(error)
            toast.error("Oops!", {
                description: "Something went wrong. Please try again later.",
            });
        }
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        addMutation.mutate(values)
        console.log(values)
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
            });
            setDays({weekends: 0, weekdays: 0});
        }}
      >
        <DialogContent className="sm:max-w-[950px] sm:max-h-[600px] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Add Reservation</DialogTitle>
            <DialogDescription>
                Create a reservation for a walk-in customer.
            </DialogDescription>
          </DialogHeader>
          <div className="">
            <Form {...form}>
                <form className="flex" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex flex-col w-1/2 gap-4 max-h-[500px] overflow-y-scroll px-8 border-r">
                        <FormField
                            name="dateRange"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Check In/Out Dates</FormLabel>
                                    <FormControl className=" ">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                    "w-full pl-3 text-left font-normal  ",
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
                                                onSelect={useCallback(field.onChange , [])}
                                                numberOfMonths={1}
                                                disabled={(date) => {
                                                    return date <= new Date();
                                                }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </FormControl>
                                    <FormDescription>
                                        Select a date range to get a list of available room types.
                                    </FormDescription>
                                </FormItem>
                            )}
                        />
                        {
                            isLoading && !data ? 
                            (
                                <div className="flex flex-col gap-2 justify-center items-center">
                                    <Loader2 className="animate-spin" />
                                    <p className="text-black/[.50]">Loading...</p>
                                </div>
                            ):
                            (
                                <>
                                    <div className="flex flex-col">
                                        <p className="text-lg font-bold">Room Details</p>
                                        <div className="flex gap-4">
                                            <div className="w-full">
                                                <FormField
                                                    name="roomType"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel onClick={() => console.log(field.value, roomTypeData, roomTypeData.find((room: any) => room.TypeName.toLowerCase() == field.value.toLowerCase()), field)}>Room Type</FormLabel>
                                                            <FormControl className=" ">
                                                                <SelectComponent
                                                                    className="w-full"
                                                                    setState={field.onChange}
                                                                    state={field.value}
                                                                    options={  Array.from(new Set(data?.map((room: any) => room.room_type))).map((roomType: any) => ({value: roomType, label: roomType})) || [{value: "Single", label: "Single"}] }
                                                                    placeholder={"Select room type..."}
                                                                />
                                                            </FormControl>
                                                            <FormDescription>
                                                            {
                                                                field.value ? 
                                                                ( <div className="flex gap-4">
                                                                    {   
                                                                    
                                                                        <>
                                                                            <div className="flex gap-2">
                                                                                <CircleUserIcon className="h-4 w-4" />
                                                                                <p>
                                                                                    {roomTypeData.find((room: any) => room.TypeName.toLowerCase() == field.value.toLowerCase())?.MaxAdult} Adults
                                                                                </p>
                                                                            </div>

                                                                            <div className="flex gap-2">
                                                                                <BabyIcon className="h-4 w-4" />
                                                                                <p>
                                                                                    {roomTypeData.find((room: any) => room.TypeName.toLowerCase() == field.value.toLowerCase())?.MaxChild} Children
                                                                                </p>
                                                                            </div>
                                                                        </>
                                                                    }
                                                                </div>):
                                                                ( "" )
                                                            }
                                                            </FormDescription>
                                                            <FormMessage>

                                                            </FormMessage>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                        </div>
                                        <div className="flex gap-4 mt-2">
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
                                                                {
                                                                    field.value && form.getValues("roomType") ?
                                                                    (
                                                                        <>
                                                                            {
                                                                               field.value > roomTypeData.find((room: any) => room.TypeName.toLowerCase() == form.getValues("roomType").toString().toLowerCase())?.MaxAdult ?
                                                                               (
                                                                                <div className="flex gap-2 text-orange-500">
                                                                                    <CircleAlertIcon className="h-4 w-4" color="currentColor" />
                                                                                    <p className="text-orange-500">{field.value - roomTypeData.find((room: any) => room.TypeName.toLowerCase() ==form.getValues("roomType").toString().toLowerCase())?.MaxAdult} extra guest</p>
                                                                                </div>
                                                                               ) : (
                                                                                ""
                                                                               )
                                                                            }
                                                                        </>
                                                                    ) : (
                                                                        <p></p>
                                                                    )
                                                                }
                                                            </FormDescription>
                                                            <FormMessage>

                                                            </FormMessage>
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
                                                                {
                                                                    field.value && form.getValues("roomType") ?
                                                                    (
                                                                        <>
                                                                            {
                                                                               field.value > childCapacity ?
                                                                               (
                                                                                <div className="flex gap-2 text-orange-500">
                                                                                    <CircleAlertIcon className="h-4 w-4" color="currentColor" />
                                                                                    <p className="text-orange-500">{field.value - childCapacity} extra guest</p>
                                                                                </div>
                                                                               ) : (
                                                                                ""
                                                                               )
                                                                            }
                                                                        </>
                                                                    ) : (
                                                                        <p></p>
                                                                    )
                                                                }
                                                            </FormDescription>
                                                            <FormMessage></FormMessage>
                                                        </FormItem>
                                                    )}
                                                />    
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
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
                                        <div className="flex flex-col gap-4 mt-4">
                                            <div className="">
                                                <FormField
                                                    name="country"
                                                    render={({ field }) => (
                                                        <FormItem className={cn("col-span-4", "sm:col-span-2")}>
                                                            <div className="flex items-center gap-2">
                                                                <FormLabel>Country</FormLabel>
                                                                <FormMessage className="text-xs" />
                                                            </div>
                                                            {/* <Input {...field} /> */}
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <FormControl>
                                                                        <Button
                                                                        variant="outline"
                                                                        role="combobox"
                                                                        className={cn(
                                                                            "w-full justify-between",
                                                                            !field.value && "text-muted-foreground"
                                                                        )}
                                                                        >
                                                                        {field.value
                                                                            ? countries.find(
                                                                                (country) => country.name === field.value
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
                                                                                form.setValue("country", country.name)
                                                                                }}
                                                                            >
                                                                                {country.name}
                                                                                <CheckIcon
                                                                                className={cn(
                                                                                    "ml-auto h-4 w-4",
                                                                                    country.name === field.value
                                                                                    ? "opacity-100"
                                                                                    : "opacity-0"
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
                                            </div>
                                            <div>
                                                <FormField
                                                    name="birthDate"
                                                    render={({ field }) => (
                                                        <FormItem className={cn("col-span-4")}>
                                                        <div className="flex items-center gap-2">
                                                            <FormLabel>Birth Date</FormLabel>
                                                            <FormMessage className="text-xs" />
                                                        </div>
                                                        <FormControl>
                                                            <DatePicker date={field.value} setDate={field.onChange} />
                                                            
                                                        </FormControl>
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
                                            <div className="">
                                                <FormField
                                                    name="request"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Special Requests</FormLabel>
                                                            <FormControl className=" ">
                                                                <Textarea className="border" {...field} value={field.value || ""} />
                                                            </FormControl>
                                                            <FormMessage></FormMessage>
                                                        </FormItem>
                                                    )}
                                                />    
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )
                        }
                    </div>
                    <div className="flex flex-col justify-between w-1/2 px-8">
                        <div className="flex flex-col w-full h-fit p-4 bg-white border-gray-200 border shadow-lg rounded">
                            <p className="text-lg font-bold" onClick={() => {console.log(roomRate)}}>Booking Summary</p>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-4 text-sm">
                                    <div>
                                        <p className="font-bold">Room</p>
                                        <div className="flex flex-col gap-2 ms-4">
                                            {
                                                days?.weekdays > 0 &&
                                                <div className="flex justify-between">
                                                    <p className="text-black/[.70] ">{days.weekdays} Weekday(s)</p>
                                                    <p className="text-black font-bold">¥{formatCurrencyJP(roomRate?.BaseRoomRate * days.weekdays)}</p>
                                                </div>  
                                            }
                                            {
                                                days?.weekends > 0 && 
                                                <div className="flex justify-between">
                                                    <p className="text-black/[.70] ">{days.weekends} Weekend(s)</p>
                                                    <p className="text-black font-bold">¥{formatCurrencyJP(roomRate?.WeekendRoomRate * days.weekends)}</p>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                    {
                                        ((extraAdult > 0 || extraChild > 0 ) && (form.getValues("roomType"))) &&
                                        <div>
                                            <div>
                                                <p className="font-bold">Extra Guests</p>
                                                <div className="flex flex-col gap-2 ms-4">
                                                    <div className="flex justify-between">
                                                        <p className="text-black/[.70] ">Adults x{extraAdult}</p>
                                                        <p className="text-black font-bold">¥{formatCurrencyJP((roomRate?.WeekendExtraAdultRate * extraAdult * days.weekends) + (roomRate?.ExtraAdultRate * extraAdult * days.weekdays))}</p>
                                                    </div> 
                                                    <div className="flex justify-between">
                                                        <p className="text-black/[.70] ">Child x{extraChild}</p>
                                                        <p className="text-black font-bold">¥{formatCurrencyJP((roomRate.ExtraChildRate * extraChild * days.weekdays) + (roomRate.WeekendExtraChildRate * extraChild * days.weekends) )}</p>
                                                    </div>
                                                    
                                                </div>
                                            </div>
                                        </div>
                                    }
                                <hr></hr>
                                <div className="flex justify-between">
                                    <p className="text-black/[.70] ">Subtotal</p>
                                    <p className="text-black font-bold">¥{formatCurrencyJP(computeInitialBooking(roomRate, days.weekends, days.weekdays, extraAdult, extraChild))}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-black/[.70] ">VAT <span className="text-black/[.50] text-sm ">(12%)</span></p>
                                    <p className="text-black font-bold">¥{formatCurrencyJP((computeInitialBooking(roomRate, days.weekends, days.weekdays, extraAdult, extraChild) * 0.12))}</p>
                                </div>
                                <div className="border-t-2 p-t-2">
                                {/* <span>Total Bill</span>
                                <span className="font-bold">
                                    {`₱ ${commafy(
                                    selectedBillingData?.TotalPerAddOn +
                                        selectedBillingData?.InitialBill -
                                        selectedBillingData?.Deposit,
                                    )}`}
                                </span> */}
                                <div className="flex justify-between bg-cstm-secondary p-4 rounded-md mt-2 items-start">
                                    <p className="text-white/[.70] ">TOTAL</p>
                                    <p className="text-white text-3xl font-bold">
                                        ¥{formatCurrencyJP((computeInitialBooking(roomRate, days.weekends, days.weekdays, extraAdult, extraChild) * 0.12) + computeInitialBooking(roomRate, days.weekends, days.weekdays, extraAdult, extraChild) )}
                                    </p>
                                </div>
                                </div>
                            </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" className="w-full text-white" disabled={isLoading || submissionLoading}>{submissionLoading ? <Loader2 size={16} color="currentColor" className="animate-spin" /> : "Submit"}</Button>
                        </div>
                    </div>
                </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    )

}
