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
import {
  editGuest,
  editGuestId,
  getGuests,
} from "@/app/ServerAction/manage.action";

export default function GuestModal() {
  const {
    guestEditModalState,
    setGuestEditModalState,
    selectedGuestData,
    setSelectedGuestData,
    guestQuery,
  } = useGlobalStore();

  const { refetch } = guestQuery();
  const formSchema = z.object({
    firstName: z.string().min(1, { message: "First Name is required" }),
    lastName: z.string().min(1, { message: "Last Name is required" }),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Invalid email address" }),
    phone: z.string().min(9, { message: "Phone number is required" }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      firstName: selectedGuestData?.FirstName || "",
      lastName: selectedGuestData?.LastName || "",
      email: selectedGuestData?.Email || "",
      phone: selectedGuestData?.Contact || "",
    },
  });

  const mutation = useMutation({
    mutationKey: ["EditGuestDetail"],
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const val = {
        ...values,
        id: selectedGuestData.Id,
      };
      const res = await editGuestId(values, selectedGuestData.Id);
      if (!res.success) {
        toast.error(res.error);
      }
      return res.res;
    },
    onSuccess: () => {
      toast.success("Guest details updated successfully");
      setGuestEditModalState(false);
      refetch();
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  return (
    <Dialog
      open={guestEditModalState}
      onOpenChange={(state) => {
        form.reset();
        setGuestEditModalState(false);
        if (!state) {
          setSelectedGuestData({});
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Guest Details</DialogTitle>
          <DialogDescription>Please edit the guest details</DialogDescription>
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
              name="firstName"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-center space-y-1">
                  <FormLabel className="text-left">First Name</FormLabel>
                  <FormControl>
                    <Input className="border" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-center space-y-1">
                  <FormLabel className="text-left">Last Name</FormLabel>
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
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-center space-y-1">
                  <FormLabel className="text-left">Email</FormLabel>
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
              name="phone"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-center space-y-1">
                  <FormLabel className="text-left">Phone Number</FormLabel>
                  <div>
                    <Input className="border" {...field} />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button className="bg-cstm-secondary" type="submit">
                Update
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
