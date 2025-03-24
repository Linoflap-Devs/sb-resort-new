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
import { useGlobalStore } from "@/store/useGlobalStore";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addWeeks, format } from "date-fns";
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
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "next-export-i18n";
import { toast } from "sonner";
import { isEmptyObj } from "@/utils/Helpers";
import { addPromos, updatePromos } from "@/app/ServerAction/promos.action";

export default function PromosModal() {
  const { t } = useTranslation();
  const generalI18n = t("general");
  const {
    promosFormModalState,
    setPromosFormModalState,
    selectedPromoData,
    setSelectedPromoData,
    roomTypeOptionsQuery,
    promosQuery,
  } = useGlobalStore();

  const isEdit = isEmptyObj(selectedPromoData) ? false : true;

  const { data: RoomTypeOption } = roomTypeOptionsQuery();
  const { refetch } = promosQuery();
  const formSchema = z.object({
    PromoCode: z.string().min(1, "Required"),
    PromoName: z.string().min(1, "Required"),
    RedemptionCount: z.string().min(1, "Required"),
    ExtraChildRate: z.string().min(1, "Required"),
    ExtraAdultRate: z.string().min(1, "Required"),
    BaseRoomRate: z.string().min(1, "Required"),
    RoomTypeId: z.string({ required_error: "Room Type is required" }),
    ExpiredAt: z.date({ required_error: "Expiry Date is required" }).nullable(),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      PromoCode: isEdit ? selectedPromoData?.PromoCode : "",
      PromoName: isEdit ? selectedPromoData?.PromoName : "",
      RedemptionCount: isEdit
        ? selectedPromoData?.RedemptionCount?.toString()
        : "",
      ExtraChildRate: isEdit
        ? selectedPromoData?.ExtraChildRate?.toString()
        : "",
      ExtraAdultRate: isEdit
        ? selectedPromoData?.ExtraAdultRate?.toString()
        : "",
      BaseRoomRate: isEdit ? selectedPromoData?.BaseRoomRate?.toString() : "",
      RoomTypeId: isEdit ? selectedPromoData?.RoomTypeId?.toString() : "",
      ExpiredAt: isEdit ? new Date(selectedPromoData?.ExpiredAt) : null,
    },
  });
  /* const onSubmit = (values: z.infer<typeof formSchema>) =>
     saddMutation.mutate(values); */

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (isEdit) {
      editMutation.mutate(values);
    } else {
      addMutation.mutate(values);
    }
  }

  const addMutation = useMutation({
    mutationFn: async (values: any) => {
      const { success, res } = await addPromos(values);
      if (!success) {
        console.log(res);
        throw new Error(res);
      }
      return res.res;
    },
    onSuccess: () => {
      setPromosFormModalState(false);
      toast.success(generalI18n.success, {
        description: "The promo rate has been successfully applied",
      });
      refetch();
    },
    onError: (err) => {
      if (err.message.includes("Duplicate")) {
        toast.error("Promo Code Already Exists", {
          description: "The promo code already exists",
        });
        return;
      } else {
        toast.error(generalI18n.somethingWentWrong, {
          description: "Please try again later",
        });
      }
    },
  });

  const editMutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await updatePromos({
        roomrateid: selectedPromoData.PromoDetailId,
        ...values,
      });
      if (!res.success) {
        console.log(res.res);
        throw new Error(res.res);
      }
      return res.res;
    },
    onSuccess: () => {
      setPromosFormModalState(false);
      toast.success("Room Successfully Updated", {
        description: "The room has been updated successfully",
      });
      refetch();
    },
    onError: (err) => {
      if (err.message.includes("Duplicate")) {
        toast.error("Promo Code Already Exists", {
          description: "The promo code already exists",
        });
        return;
      } else {
        toast.error("Something went wrong", {
          description: "Please try again later",
        });
      }
    },
  });

  return (
    <Dialog
      open={promosFormModalState}
      onOpenChange={(open) => {
        form.reset();
        setPromosFormModalState(open);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Promo Rate" : "Add Promo Rate"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Please fill up the form to edit promo rate"
              : "Please fill up the form to add new promo rate"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-1" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex gap-2">
              <FormField
                name="PromoName"
                render={({ field }) => (
                  <FormItem className="w-3/5">
                    <FormLabel>Promo Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <div className="h-4">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                name="RedemptionCount"
                render={({ field }) => (
                  <FormItem className="w-2/5">
                    <FormLabel>Max Redemption</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <div className="h-4">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              name="PromoCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promo Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <div className="h-4">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ExpiredAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expiry Date</FormLabel>
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
                        selected={field.value as Date}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="RoomTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RoomTypeOption.map((roomType: any) => (
                        <SelectItem
                          key={roomType.label}
                          value={roomType.value.toString()}
                        >
                          {roomType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="BaseRoomRate"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Base Room Rate</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <FormField
                name="ExtraChildRate"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>Extra Child Rate</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="ExtraAdultRate"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>Extra Adult Rate</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button className="mt-8 bg-cstm-secondary" type="submit">
                {isEdit ? "Update Promo Rate" : "Add Promo Rate"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
