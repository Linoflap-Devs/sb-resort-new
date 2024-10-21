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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGlobalStore } from "@/store/useGlobalStore";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  addBillings,
  getRoomOptions,
} from "@/app/ServerAction/reservations.action";
import { getCurrentRoomTypesRate } from "@/app/ServerAction/rooms.action";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/MultiSelect";
import { calculateInitialBill, commafy } from "@/utils/Helpers";
import { useTranslation } from "next-export-i18n";
export default function BillingFormModal() {
  const { t } = useTranslation();
  const reservationI18n = t("ReservationsPage");
  const generali18n = t("general");
  const roomsI18n = t("RoomsPage");
  const {
    billingFormModalState,
    setBillingFormModalState,
    selectedReservationData,
    reservationQuery,
  } = useGlobalStore();

  const { refetch: refetchReservation } = reservationQuery();

  const mutation = useMutation({
    mutationKey: ["AddBilling"],
    mutationFn: async (values: any) => {
      const res = await addBillings(values);
      if (!res.success) throw new Error();
      return res;
    },
    onSuccess: () => {
      toast.success(generali18n.success, {
        description: "The room has been added successfully",
      });
      refetchReservation();
    },
    onError: () => {
      toast.error(generali18n.somethingWentWrong, {
        description: "Please try again later",
      });
    },
  });

  const { data: currentRoomtypeRate, isFetched } = useQuery({
    queryKey: ["RoomTypePrice", selectedReservationData?.RoomTypeId || 0],
    enabled: selectedReservationData ? true : false,
    queryFn: async () => {
      const res = await getCurrentRoomTypesRate(
        selectedReservationData?.RoomTypeId || 0,
      );
      if (!res.success) throw new Error();
      return calculateInitialBill(
        new Date(selectedReservationData?.CreatedAt || ""),
        selectedReservationData?.RoomCount || 1,
        res.res[0]?.BaseRoomRate,
        res.res[0]?.WeekendRoomRate,
        selectedReservationData?.ExtraAdult || 0,
        res.res[0]?.ExtraAdultRate,
        res.res[0]?.WeekendExtraAdultRate,
        selectedReservationData?.ExtraChild || 0,
        res.res[0]?.ExtraChildRate,
        res.res[0]?.WeekendExtraChildRate,
      );
    },
  });

  const { data: RoomOptions } = useQuery({
    queryKey: ["RoomsOpt", selectedReservationData?.RoomTypeId],
    enabled: selectedReservationData ? true : false,
    queryFn: async () => {
      const res = await getRoomOptions(selectedReservationData?.RoomTypeId);
      if (!res.success) throw new Error();
      return res.res;
    },
  });

  const formSchema = z.object({
    RoomNumbers: z.array(z.number()).min(selectedReservationData?.RoomCount, {
      message: "Please enter room number",
    }),
    InitialBill: z.number().min(1),
    Deposit: z.string().min(1, { message: "Please enter deposit amount" }),
    ReservationId: z.number().min(1),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      RoomNumbers: [],
      InitialBill: currentRoomtypeRate || 0,
      Deposit: "",
      ReservationId: selectedReservationData?.Id || 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // console.log(values);
    mutation.mutate(values);
  }
  return (
    <Dialog
      open={billingFormModalState}
      onOpenChange={(open) => {
        form.reset();
        setBillingFormModalState(open);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{reservationI18n.billing}</DialogTitle>
          <DialogDescription>
            {reservationI18n.billingFormDesc}
          </DialogDescription>
          <div className="flex border-t border-cstm-secondary pt-2">
            <div className="w-1/2">
              <DialogDescription className="font-semibold">
                {reservationI18n.reservationId}: {selectedReservationData?.Id}
              </DialogDescription>
              <DialogDescription className="font-semibold">
                {reservationI18n.numberOfRooms}:
                {`${selectedReservationData?.RoomCount}`}
              </DialogDescription>
            </div>
            <div className="w-1/2">
              <DialogDescription className="font-semibold">
                {roomsI18n.roomType}: {selectedReservationData?.RoomType}
              </DialogDescription>
              <DialogDescription className="font-semibold">
                {reservationI18n.initialBill}:{" "}
                <span className="text-green-500">
                  {`${
                    !isFetched
                      ? "Calculating..."
                      : `P ${commafy(currentRoomtypeRate || 0)}`
                  }`}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-1" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Change to ComboBox */}
            <FormField
              control={form.control}
              name="RoomNumbers"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{roomsI18n.roomNumber}</FormLabel>
                  <MultiSelector
                    values={field.value}
                    onValuesChange={field.onChange}
                    loop
                    className="max-w text-sm" 
                    maximumSelectedValues={selectedReservationData?.RoomCount}
                  >
                    <MultiSelectorTrigger>
                      <MultiSelectorInput placeholder={roomsI18n.roomNumber} />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        {RoomOptions &&
                          RoomOptions.map((item) => (
                            <MultiSelectorItem
                              key={item.label}
                              value={item.label}
                            >
                              Room {item.label}
                            </MultiSelectorItem>
                          ))}
                      </MultiSelectorList>
                    </MultiSelectorContent>
                  </MultiSelector>
                  <div className="h-4">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Deposit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{reservationI18n.deposit}</FormLabel>
                  <Input type="number" {...field} />
                  <div className="h-4">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button className="bg-cstm-secondary" type="submit">
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
