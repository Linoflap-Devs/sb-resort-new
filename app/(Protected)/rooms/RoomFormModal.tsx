"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import SelectComponent from "@/components/SelectComponent";
import { addRoom, editRoom } from "@/app/ServerAction/rooms.action";
import i18n, { useTranslation } from "next-export-i18n";
export default function RoomFormModal() {
  const { t } = useTranslation();
  const roomsI18n = t("RoomsPage");
  const generali18n = t("general");
  const {
    roomFormModalState,
    setRoomFormModalState,
    selectedRoomData,
    roomTypeOptionsQuery,
    roomStatusOptionsQuery,
    roomsQuery,
  } = useGlobalStore();

  const formSchema = z.object({
    roomNumber: z.string().min(1, { message: "Please enter room number" }),
    roomType: z.string().min(1, { message: "Please select room type" }),
    status: z.string().min(1, { message: "Please select room status" }),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      roomNumber: selectedRoomData
        ? selectedRoomData.RoomNumber.toString()
        : "",
      roomType: selectedRoomData ? selectedRoomData.RoomTypeId.toString() : "",
      status: selectedRoomData ? selectedRoomData.StatusId.toString() : "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }
  const { data: roomTypeOptions } = roomTypeOptionsQuery();
  const { data: roomStatusOptions } = roomStatusOptionsQuery();
  const { refetch } = roomsQuery();
  const mutation = useMutation({
    mutationFn: async (values: { roomNumber: string; roomType: string }) => {
      const res = selectedRoomData
        ? await editRoom({ Id: selectedRoomData.Id, ...values })
        : await addRoom(values);
      if (!res.success) throw new Error(res.error);
      return res.res;
    },
    onSuccess: () => {
      setRoomFormModalState(false);
      if (selectedRoomData) {
        toast.success(roomsI18n.toast.success, {
          description: roomsI18n.toast.editRoomSuccess,
        });
      } else {
        toast.success(roomsI18n.toast.success, {
          description: roomsI18n.toast.addRoomSuccess,
        });
      }
      refetch();
    },
    onError: (error) => {
      const errorMessage = error.message.includes("duplicate key")
        ? "Room Number Already Exists."
        : "Please try again later.";
      if (error.message.includes("duplicate key")) {
        form.setError("roomNumber", { message: "Room Number Already Exists" });
      }
      toast.error("Something went wrong", {
        description: errorMessage,
      });
    },
  });
  return (
    <Dialog
      open={roomFormModalState}
      onOpenChange={(open) => {
        setRoomFormModalState(open);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {selectedRoomData ? roomsI18n.editRoom : roomsI18n.addRoom}
          </DialogTitle>
          <DialogDescription>
            {selectedRoomData
              ? roomsI18n.dialogDescEditRoom
              : roomsI18n.dialogDescAddRoom}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="roomNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{roomsI18n.roomNumber}</FormLabel>
                  <FormControl>
                    <Input
                      disabled={selectedRoomData ? true : false}
                      placeholder={roomsI18n.enterRoomNumber}
                      type="number"
                      {...field}
                    />
                  </FormControl>
                  <div className="h-4">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roomType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{roomsI18n.roomType}</FormLabel>
                  <SelectComponent
                    className="w-full"
                    options={roomTypeOptions}
                    placeholder={roomsI18n.selectRoomType}
                    setState={field.onChange}
                    state={field.value}
                  />
                  <div className="h-4">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{roomsI18n.roomStatus}</FormLabel>
                  <SelectComponent
                    className="w-full"
                    options={roomStatusOptions}
                    placeholder={roomsI18n.selectStatus}
                    setState={field.onChange}
                    state={field.value}
                  />
                  <div className="h-4">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button className="bg-cstm-secondary" type="submit">
                {selectedRoomData ? generali18n.update : roomsI18n.addRoom}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
