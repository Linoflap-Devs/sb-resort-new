"use client";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import SelectComponent from "@/components/SelectComponent";
import { useGlobalStore } from "@/store/useGlobalStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
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
import { format } from "date-fns";
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
import { useMutation } from "@tanstack/react-query";
import {
  addReservationsLobby,
  editReservations,
} from "@/app/ServerAction/reservations.action";
import { toast } from "sonner";
import { useEffect } from "react";
import { isEmptyObj } from "@/utils/Helpers";
import { useTranslation } from "next-export-i18n";
import { Textarea } from "@/components/ui/textarea";
import { Reservation } from "@/types";

export default function ReservationModal() {
  const {
    roomTypeOptionsQuery,
    setReservationFormModalState,
    reservationFormModalState,
    selectedReservationData,
    reservationQuery,
    setSelectedReservationData,
  } = useGlobalStore();

  const { t } = useTranslation();
  const roomsI18n = t("ReservationsPage");
  const generali18n = t("general");
  const locale = t("locale");
  const { data: RoomTypeOption } = roomTypeOptionsQuery();
  const { refetch } = reservationQuery();

  const formSchema = z.object({
    RoomTypeId: z.string().min(1, { message: "Room Type is required" }),
    RoomCount: z.string().min(1, { message: "Room Count is required" }),
    dateRange: z
      .object(
        {
          from: z.date().nullable(),
          to: z.date().nullable(),
        },
        { required_error: "Please select a date range" },
      )
      .refine(
        (data) => new Date(data.from as Date) < new Date(data.to as Date),
        {
          path: ["dateRange"],
          message: "From date must be before to date",
        },
      ),
    ExtraChild: z.string().min(1, { message: "ExtraChild is required" }),
    ExtraAdult: z.string().min(1, { message: "ExtraAdult is required" }),
    Remarks: z.string().nullable().optional(),
  });

  const mutation = useMutation({
    mutationKey: ["addReservationLobby"],
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = !isEmptyObj(selectedReservationData)
        ? await editReservations({
            ...values,
            Id: selectedReservationData.Id,
          })
        : await addReservationsLobby(values);
      if (!res.success) {
        throw new Error("Something went wrong, please try again later");
      }
      return res.res;
    },
    onSuccess: () => {
      if (selectedReservationData) {
        toast.success("Success", {
          description: "Reservation updated successfully",
        });
      } else {
        toast.success("Success", {
          description: "Reservation added successfully",
        });
      }
      refetch();
      setReservationFormModalState(false);
    },
    onError: () => {
      toast.error("Failed", {
        description: "Something went wrong, please try again later",
      });
    },
    onSettled: () => {
      setSelectedReservationData({} as Reservation);
      // form.reset();
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      RoomTypeId: !isEmptyObj(selectedReservationData)
        ? selectedReservationData?.RoomTypeId?.toString()
        : " ",
      RoomCount: !isEmptyObj(selectedReservationData)
        ? selectedReservationData?.RoomCount?.toString()
        : " ",
      ExtraChild: !isEmptyObj(selectedReservationData)
        ? selectedReservationData?.ExtraChild?.toString()
        : " ",
      ExtraAdult: !isEmptyObj(selectedReservationData)
        ? selectedReservationData?.ExtraAdult?.toString()
        : " ",
      dateRange: {
        from: !isEmptyObj(selectedReservationData)
          ? new Date(selectedReservationData?.CheckInDate)
          : null,
        to: !isEmptyObj(selectedReservationData)
          ? new Date(selectedReservationData?.CheckOutDate)
          : null,
      },
      Remarks: !isEmptyObj(selectedReservationData)
        ? selectedReservationData.Remarks
        : "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  return (
    <Dialog
      open={reservationFormModalState}
      onOpenChange={(state) => {
        form.reset();
        setReservationFormModalState(state);
        if (!state) {
          setSelectedReservationData({} as Reservation);
        }
      }}
    >
      {/* <DialogContent></DialogContent> */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {!isEmptyObj(selectedReservationData)
              ? roomsI18n.editReservation
              : roomsI18n.addReservation}
          </DialogTitle>
          <DialogDescription>
            {!isEmptyObj(selectedReservationData)
              ? roomsI18n.dialogDescEditReservation
              : roomsI18n.dialogDescAddReservation}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-col gap-2 space-y-2"
            onSubmit={form.handleSubmit(
              (data) => {
                console.log("Form valid, submitting data:", data);
                onSubmit(data); // call your onSubmit here
              },
              (errors) => {
                console.log(form.getValues());
                console.error("Form validation errors:", errors);
              },
            )}
          >
            <FormField
              control={form.control}
              name="RoomTypeId"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-center space-y-1">
                  <FormLabel className="mb-2 text-left">Room Type</FormLabel>
                  <div>
                    <SelectComponent
                      placeholder="Select Room Type"
                      className="w-full"
                      options={RoomTypeOption}
                      state={field.value}
                      setState={field.onChange}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="RoomCount"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-center space-y-1">
                  <FormLabel className="mb-2 text-left">Room Count</FormLabel>
                  <div>
                    <FormControl>
                      <Input className="border" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/*  <FormField
                name="dateRange"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel className="text-center">
                      Check In - Check Out Date
                    </FormLabel>
                    <FormControl>
                      <Popover modal>
                        <PopoverTrigger>
                          <FormControl>
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
                              return date < new Date();
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
            <FormField
              control={form.control}
              name="ExtraChild"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-center space-y-1">
                  <FormLabel className="mb-2 text-left">
                    Extra Child Count
                  </FormLabel>
                  <div>
                    <FormControl>
                      <Input className="border" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ExtraAdult"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-center space-y-1">
                  <FormLabel className="mb-2 text-left">
                    Extra Adult Count
                  </FormLabel>
                  <div>
                    <Input className="border" {...field} />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Remarks"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-center space-y-1">
                  <FormLabel className="mb-2 text-left">Remarks</FormLabel>
                  <div>
                    <FormControl>
                      <Textarea
                        className="border"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              {/* <DialogClose asChild>
                <Button variant={"ghost"}>Cancel</Button>
              </DialogClose> */}
              <Button className="bg-cstm-secondary" type="submit">
                {!isEmptyObj(selectedReservationData)
                  ? generali18n.update
                  : generali18n.add}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
