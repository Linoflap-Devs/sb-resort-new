"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useGlobalStore } from "@/store/useGlobalStore";
import { addWeeks } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import SelectComponent from "@/components/SelectComponent";
import { useTranslation } from "next-export-i18n";
import { addRoomRate, editRoomRate } from "@/app/ServerAction/rooms.action";
import { useEffect } from "react";

export default function RoomRatesModal() {
  const { t } = useTranslation();
  const roomsI18n = t("RoomsPage");
  const generalI18n = t("general");
  const locale = t("locale");

  const {
    rateFormModalState,
    setRateFormModalState,
    selectedRateData,
    roomTypeOptionsQuery,
    localeFns,
    roomRatesQuery,
    roomRateTypesQuery,
  } = useGlobalStore();

  const { data: RoomTypeOption } = roomTypeOptionsQuery();
  const { data: RoomRateTypes } = roomRateTypesQuery();
  const formSchema = z.object({
    /* Room Details */
    RoomTypeId: z.string().min(1, { message: "Required" }),
    RateTypeId: z.string().min(1, { message: "Required" }),
    validity: z.object({
      from: z.date().default(new Date()),
      to: z.date().default(addWeeks(new Date(), 1)),
    }),
    /* Weekend Rate */
    BaseRoomRate: z.string().min(1, { message: "Required" }),
    ExtraAdultRate: z.string().min(1, { message: "Required" }),
    ExtraChildRate: z.string().min(1, { message: "Required" }),
    /* Weekday Rate */
    WeekendRoomRate: z.string().min(1, { message: "Required" }),
    WeekendExtraAdultRate: z.string().min(1, { message: "Required" }),
    WeekendExtraChildRate: z.string().min(1, { message: "Required" }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    values: {
      RoomTypeId: selectedRateData
        ? selectedRateData?.RoomTypeId.toString()
        : "",
      RateTypeId: selectedRateData
        ? selectedRateData?.RateTypeId.toString()
        : "",
      validity: {
        from: selectedRateData ? selectedRateData?.ValidFrom : 0,
        to: selectedRateData ? selectedRateData?.ValidTo : 0,
      },
      BaseRoomRate: selectedRateData
        ? selectedRateData?.BaseRoomRate.toString()
        : "",
      ExtraAdultRate: selectedRateData
        ? selectedRateData?.ExtraAdultRate.toString()
        : "",
      ExtraChildRate: selectedRateData
        ? selectedRateData?.ExtraChildRate.toString()
        : "",
      WeekendRoomRate: selectedRateData
        ? selectedRateData?.WeekendRoomRate.toString()
        : "",
      WeekendExtraAdultRate: selectedRateData
        ? selectedRateData?.WeekendExtraAdultRate.toString()
        : "",
      WeekendExtraChildRate: selectedRateData
        ? selectedRateData?.WeekendExtraChildRate.toString()
        : "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    mutation.mutate(values);
  }

  const mutation = useMutation({
    mutationFn: (values: any) => {
      if (selectedRateData) {
        editRoomRate({ ...values, Id: selectedRateData?.Id });
      } else {
        addRoomRate(values);
      }
      return values;
    },
    onSuccess: () => {
      setRateFormModalState(false);
      if (selectedRateData) {
        toast.success("Rate Updated Successfully");
      } else {
        toast.success("Rate Added Successfully");
      }
      refetch();
    },
    onError: () => {
      toast.error("Rate Not Added");
    },
    onSettled: () => {
      form.reset();
    },
  });

  const { refetch } = roomRatesQuery();

  return (
    <Dialog
      open={rateFormModalState}
      onOpenChange={(open) => {
        setRateFormModalState(open);
        form.reset();
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {selectedRateData ? roomsI18n.editRate : roomsI18n.addRate}
          </DialogTitle>
          <DialogDescription>
            {selectedRateData
              ? roomsI18n.dialogDescEditRoomRate
              : roomsI18n.dialogDescAddRoomRate}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-col gap-2"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="RoomTypeId"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-center space-y-1">
                  <FormLabel className="mb-2 text-left">
                    {roomsI18n.roomType}
                  </FormLabel>
                  <div>
                    <SelectComponent
                      className="w-full"
                      options={RoomTypeOption}
                      state={field.value}
                      setState={field.onChange}
                    />
                    <div className="h-3 text-center align-top">
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="RateTypeId"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-center space-y-1">
                  <FormLabel className="mb-2 text-left">
                    {roomsI18n.rateType}
                  </FormLabel>
                  <div>
                    <SelectComponent
                      className="w-full"
                      options={RoomRateTypes?.filter(
                        (option: { value: number }) => option.value !== 2,
                      )} // Fixed with type
                      state={field.value}
                      setState={field.onChange}
                    />
                    <div className="h-3 text-center">
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="validity"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-center space-y-1">
                  <FormLabel className="mb-2 flex flex-col items-center text-left">
                    {roomsI18n.validityDate}
                  </FormLabel>
                  <div className="flex flex-col items-start">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          variant={"outline"}
                          className={cn(
                            "mx-auto w-[300px] justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value?.from ? (
                            field.value.to ? (
                              <>
                                {format(field.value.from, "LLL dd, y", {
                                  locale: localeFns[locale],
                                })}{" "}
                                -{" "}
                                {format(field.value.to, "LLL dd, y", {
                                  locale: localeFns[locale],
                                })}
                              </>
                            ) : (
                              format(field.value.from, "LLL dd, y", {
                                locale: localeFns[locale],
                              })
                            )
                          ) : (
                            <span>{generalI18n.pickDateRange}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          locale={localeFns[locale]}
                          mode="range"
                          defaultMonth={field.value?.from}
                          selected={field.value}
                          onSelect={field.onChange}
                          numberOfMonths={2}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <div className="h-3 text-center">
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />
            <div className="flex flex-row gap-3 pt-2">
              <div className="w-1/2">
                <h1 className="text-left text-sm font-semibold">
                  {"Weekday Room Rates"}
                </h1>
                <FormField
                  control={form.control}
                  name="BaseRoomRate"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-left">
                        {roomsI18n.weekdayRate}
                      </FormLabel>
                      <div>
                        <Input {...field} />
                        <div className="h-3">
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ExtraAdultRate"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>{roomsI18n.extraAdultRate}</FormLabel>
                      <div>
                        <Input {...field} />
                        <div className="h-3">
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ExtraChildRate"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>{roomsI18n.extraChildRate}</FormLabel>
                      <div>
                        <Input {...field} />
                        <div className="h-3">
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-1/2">
                <h1 className="text-left text-sm font-semibold">
                  {"Weekend Room Rates"}
                </h1>
                <FormField
                  control={form.control}
                  name="WeekendRoomRate"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>{roomsI18n.weekendRate}</FormLabel>
                      <div>
                        <Input {...field} />
                        <div className="h-3">
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="WeekendExtraAdultRate"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>{roomsI18n.weekendextraAdultRate}</FormLabel>
                      <div>
                        <Input {...field} />
                        <div className="h-3">
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="WeekendExtraChildRate"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>{roomsI18n.weekendextraChildRate}</FormLabel>
                      <div>
                        <Input {...field} />
                        <div className="h-3">
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button className="bg-cstm-secondary" type="submit">
                {selectedRateData ? generalI18n.update : roomsI18n.addRate}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
