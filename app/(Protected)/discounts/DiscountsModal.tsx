"use client"
"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useGlobalStore } from "@/store/useGlobalStore";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addWeeks, format, set } from "date-fns";
import { cn } from "@/lib/utils";

import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SelectComponent from "@/components/SelectComponent";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "next-export-i18n";
import { toast } from "sonner";
import { convertToLocalUTC, isEmptyObj } from "@/utils/Helpers";
import { addPromos, updatePromos } from "@/app/ServerAction/promos.action";
import { DatePicker } from "@/components/ui/calendar2";
import { useEffect, useState } from "react";
import { addDiscount, updateDiscount } from "@/app/ServerAction/discounts.action";

export function DiscountsModal() {
    const { 
        discountFormModalState, 
        setDiscountFormModalState, 
        selectedDiscountData, 
        roomTypeOptionsQuery, 
        getDiscountsQuery, 
        setSelectedDiscountData, 
        selectedDiscountRoomType, 
        setSelectedDiscountRoomType } = useGlobalStore();
    useEffect(() => {
        console.log(selectedDiscountData)
        console.log(form.getValues())
    }, [])

    const { data: RoomTypeOption } = roomTypeOptionsQuery();

    const [editMode, setEditMode] = useState(false);
    const { refetch } = getDiscountsQuery();
    const formSchema = z.object({
        discountName: z.string().min(1, {message: "Please enter a discount name."}),
        discountCode: z.string().min(1, {message: "Please enter a discount code."}),
        discountType: z.string().min(1, {message: "Please select a discount type."}),
        discountValue: z.coerce.number().min(1, {message: "Please enter a discount value."}),
        discountStartDate: z.date().nullable(),
        discountEndDate: z.date().nullable(),
        minimumStay: z.coerce.number().optional(),
        maximumStay: z.coerce.number().optional(),
        minimumTotal: z.coerce.number().optional(),
        maximumTotal: z.coerce.number().optional(),
        maxUsage: z.coerce.number().optional(),
        roomTypes: z.array(z.number()).optional(),
    })

    useEffect(() => {
        console.log(selectedDiscountData)
        selectedDiscountData.Id ? setEditMode(true) : setEditMode(false);
        console.log(editMode)
    }, [selectedDiscountData])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            discountName: "",
            discountCode: "",
            discountType: "",
            discountValue: 0,
            discountStartDate: null,
            discountEndDate: null,
            minimumStay: 0,
            maximumStay: 30,
            minimumTotal: 0,
            maximumTotal: 99000,
            maxUsage: 99,
            roomTypes: [],
        },
        values: {
            discountName: selectedDiscountData && selectedDiscountData.DiscountName ? selectedDiscountData.DiscountName : "",
            discountCode: selectedDiscountData && selectedDiscountData.DiscountCode ? selectedDiscountData.DiscountCode : "",
            discountType: selectedDiscountData && selectedDiscountData.DiscountType ? selectedDiscountData.DiscountType : "",
            discountValue: selectedDiscountData && selectedDiscountData.DiscountValue ? selectedDiscountData.DiscountValue : 0,
            discountStartDate: selectedDiscountData && selectedDiscountData.StartDate ? new Date(selectedDiscountData.StartDate) : null,
            discountEndDate: selectedDiscountData && selectedDiscountData.EndDate ? new Date(selectedDiscountData.EndDate) : null,
            minimumStay: selectedDiscountData && selectedDiscountData.MinNight ? selectedDiscountData.MinNight : null,
            maximumStay: selectedDiscountData  && selectedDiscountData.MaxNight? selectedDiscountData.MaxNight : null,            
            minimumTotal: selectedDiscountData && selectedDiscountData.MinAmount ? selectedDiscountData.MinAmount: null,
            maximumTotal: selectedDiscountData && selectedDiscountData.MaxAmount ? selectedDiscountData.MaxAmount : null,
            maxUsage: selectedDiscountData && selectedDiscountData.MaxUsage ? selectedDiscountData.MaxUsage : null,
            roomTypes: selectedDiscountRoomType ? selectedDiscountRoomType : [],
        }
    })

    const addDiscountToastId = "addDiscountStatus";
    const addDiscountMutation = useMutation({

        mutationFn: async (data: z.infer<typeof formSchema>) => {
            toast.loading("Adding discount...", { id: addDiscountToastId, description: null });
            const obj = {
                DiscountName: data.discountName,
                DiscountCode: data.discountCode,
                DiscountType: data.discountType === "flat" ? "flat" : "percentage",
                DiscountValue: data.discountValue,
                StartDate: data.discountStartDate ? convertToLocalUTC(data.discountStartDate) : null,
                EndDate: data.discountEndDate ? convertToLocalUTC(data.discountEndDate) : null,
                MinNight: data.minimumStay || null,
                MaxNight: data.maximumStay || null,
                MinAmount: data.minimumTotal || null,
                MaxAmount: data.maximumTotal || null,
                MaxUsage: data.maxUsage || null
            }
            const { res } = await addDiscount(obj, data.roomTypes || []);
            if (!res) {
                throw new Error("error");
            } 
            return res
        },
        onSuccess: () => {
            toast.success("Success", {
                description: "Discount added successfully.",
                id: addDiscountToastId,
                duration: 2000
            });
            refetch(); 
            setSelectedDiscountData({} as any);
            form.reset();
            setDiscountFormModalState(false);
        },
        onError: () => {
            toast.error("Oops!", {
                description: "Discount could not be added. Try again later.",
                id: addDiscountToastId,
                duration: 2000
            });
        }
    })

    const editDiscountToastId = "editDiscountStatus";
    const editMutation = useMutation({
        mutationFn: async (data: z.infer<typeof formSchema>) => {
            toast.loading("Updating discount...", { id: editDiscountToastId, description: null });
            const obj = {
                id: selectedDiscountData?.Id,
                discountName: data.discountName,
                discountCode: data.discountCode,
                discountType: data.discountType,
                discountValue: data.discountValue,
                startDate: data.discountStartDate || null,
                endDate: data.discountEndDate || null,
                minNight: data.minimumStay || null,
                maxNight: data.maximumStay || null,
                minAmount: data.minimumTotal || null,
                maxAmount: data.maximumTotal || null,
                maxUsage: data.maxUsage || null
            }
            const rooms = {
                old: selectedDiscountRoomType || [],
                new: data.roomTypes || []
            }
            return await updateDiscount(obj, rooms);
        },
        onSuccess: () => {
            toast.success("Success", {
                description: "Discount updated successfully.",
                id: editDiscountToastId,
                duration: 2000
            });
            refetch();
            setDiscountFormModalState(false);
        },
        onError: () => {
            
            toast.error("Oops!", {
                description: "Discount could not be updated. Try again later.",
                id: editDiscountToastId,
                duration: 2000
            });
        }
    })

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        const oldRooms = selectedDiscountRoomType;
        const newRooms = data.roomTypes;
        editMode ? editMutation.mutate(data) : addDiscountMutation.mutate(data);
    }

    useEffect(() => {
        console.log(form.getValues("roomTypes"))
    }, [form.watch("roomTypes")])
    
    return (
        <Dialog
            open={discountFormModalState}
            onOpenChange={(open) => {
                form.reset();
                setSelectedDiscountData({} as any);
                setDiscountFormModalState(open);
                setSelectedDiscountRoomType([]);
            }}
        >
            <DialogContent className="sm:max-w-[800px] max-h-[1200px]">
                <DialogHeader>
                    <DialogTitle>{editMode ? "Edit Discount" :"Add Discount"}</DialogTitle>
                    <DialogDescription>
                        {"Please fill out the form to add a new discount."}
                    </DialogDescription>
                </DialogHeader>
                {/* <Button onClick={
                    () => {
                        console.log(selectedDiscountData)
                        console.log(selectedDiscountRoomType)
                        console.log(form.getValues())
                        console.log(form.getValues("discountStartDate")?.toISOString())
                        console.log(form.getValues("discountStartDate")?.toUTCString())
                    }
                }>
                    Console
                </Button> */}
                {/* <Button onClick={
                    () => {
                        form.reset()
                    }
                }>
                    Reset
                </Button> */}
                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="flex">
                                <div className="flex flex-col gap-4 w-2/3 pr-4">
                                    <div className="flex flex-col">
                                        <p className="text-lg font-semibold text-cstm-secondary mb-2">Discount Details</p>
                                        <div className="flex flex-col gap-4">
                                            <div className="flex gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="discountName"
                                                    render={({ field }) => (
                                                        <FormItem className="w-1/2">
                                                            <FormLabel>Discount Name</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Sample Discount"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="discountCode"
                                                    render={({ field }) => (
                                                        <FormItem className="w-1/2">
                                                            <FormLabel>Discount Code</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="ABC123"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="flex gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="discountType"
                                                    render={({ field }) => (
                                                        <FormItem className="w-1/2">
                                                            <FormLabel>Discount Type</FormLabel>
                                                            <FormControl>
                                                            <SelectComponent
                                                                className="w-full"
                                                                setState={field.onChange}
                                                                state={field.value}
                                                                options={[
                                                                    {
                                                                        label: "Percentage",
                                                                        value: "Percentage"
                                                                    },
                                                                    {
                                                                        label: "Flat",
                                                                        value: "Flat"
                                                                    }
                                                                ]}
                                                                placeholder={"Select Discount Type"}
                                                            />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="discountValue"
                                                    render={({ field }) => (
                                                        <FormItem className="w-1/2">
                                                            <FormLabel>Discount Value</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="0"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col mt-4">
                                        <div className="flex flex-col mb-2">
                                            <p className="text-lg font-semibold text-cstm-secondary mb-0">Discount Criteria</p>
                                            <p className="text-sm text-black/[.70]">Optional criteria for discount eligibility.</p>
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            <div className="flex gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="discountStartDate"
                                                    render={({ field }) => (
                                                        <FormItem className="w-1/2">
                                                            <FormLabel>Start Date</FormLabel>
                                                            <FormControl>
                                                                <DatePicker date={field.value || undefined} setDate={field.onChange} />
                                                            </FormControl>
                                                            <FormDescription className="text-xs">
                                                                Date when the discount becomes active.
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="discountEndDate"
                                                    render={({ field }) => (
                                                        <FormItem className="w-1/2">
                                                            <FormLabel>End Date</FormLabel>
                                                            <FormControl>
                                                                <DatePicker date={field.value || undefined} setDate={field.onChange} />
                                                            </FormControl>
                                                            <FormDescription className="text-xs">
                                                                Discount expiration date.
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="flex gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="minimumStay"
                                                    render={({ field }) => (
                                                        <FormItem className="w-1/2">
                                                            <FormLabel>Minimum Stay</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Minimum stay"
                                                                    type="number"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormDescription className="text-xs">
                                                                Minimum stay required for eligibility.
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="maximumStay"
                                                    render={({ field }) => (
                                                        <FormItem className="w-1/2">
                                                            <FormLabel>Maximum Stay</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Maximum stay"
                                                                    type="number"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormDescription className="text-xs">
                                                                Minimum nights for discount eligibility.
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="flex gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="minimumTotal"
                                                    render={({ field }) => (
                                                        <FormItem className="w-1/2">
                                                            <FormLabel>Minimum Billing</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Minimum total"
                                                                    type="number"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormDescription className="text-xs"> 
                                                                Minimum booking cost to qualify.
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="maximumTotal"
                                                    render={({ field }) => (
                                                        <FormItem className="w-1/2">
                                                            <FormLabel>Maximum Billing</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Maximum total"
                                                                    type="number"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormDescription className="text-xs">
                                                                Maximum booking amount required for eligibility.
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="flex gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="maxUsage"
                                                    render={({ field }) => (
                                                        <FormItem className="w-1/2">
                                                            <FormLabel>Maximum Usage</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Maximum usage"
                                                                    type="number"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormDescription className="text-xs">
                                                                Total number of times this discount can be redeemed.
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                        
                                    </div>
                                </div>
                                <div className="flex flex-col w-1/3 border-l pl-4 ">
                                    <p className="text-lg font-semibold text-cstm-secondary mb-2">Eligible Room Types</p>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex gap-4">
                                            <FormField
                                                control={form.control}
                                                name="roomTypes"
                                                render={({ field }) => {
                                                    const allSelected = RoomTypeOption.every((type: any) => field.value?.includes(type.value));
                                                    const handleSelectAll = () => {
                                                        const allLabels = RoomTypeOption.map((type: any) => type.value);
                                                        field.onChange(allSelected ? [] : allLabels); // Toggle all options
                                                    };
                                                    const handleCheckboxChange = (option: number) => {
                                                        const newValue = (field.value ?? []).includes(option)
                                                          ? field.value?.filter((item) => item !== option)
                                                          : [...(field.value ?? []), option];
                                                        field.onChange(newValue); // Update form field
                                                      };
                                                    return (
                                                        <FormItem className="w-full">
                                                            <FormLabel>List of Rooms</FormLabel>
                                                            <FormControl>
                                                                <div className="grid grid-cols-1 max-h-[700px] overflow-auto">
                                                                    <label className="flex items-center space-x-2">
                                                                        <input
                                                                        type="checkbox"
                                                                        checked={allSelected}
                                                                        onChange={handleSelectAll}
                                                                        />
                                                                        <span className="font-semibold text-sm">Select All</span>
                                                                    </label>
                                                                    <hr className="my-2"></hr>
                                                                    {
                                                                        RoomTypeOption?.map((type: any) => (
                                                                            <label key={type.value} className="flex items-center space-x-2 w-full">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={field.value?.includes(type.value)}
                                                                                    onChange={() => handleCheckboxChange(type.value)}
                                                                                />
                                                                                <span className="w-full text-sm">{type.label}</span>
                                                                            </label>
                                                                        ))
                                                                    }
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t flex gap-4 justify-end">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => {
                                            setDiscountFormModalState(false);
                                            setSelectedDiscountData({});
                                            form.reset();
                                            console.log(selectedDiscountData)
                                            console.log(form)
                                        }
                                    }
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editMode ? "Update Discount" : "Add Discount"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}