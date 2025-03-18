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
import {
  addAmenity,
  addRoomRate,
  editAmenity,
  editRoomRate,
} from "@/app/ServerAction/rooms.action";
import { useEffect } from "react";

export function AmenitiesModal() {
  const { t } = useTranslation();
  const amenityI18n = t("Amenity");
  const genI18n = t("general");

  const {
    amenityFormModalState,
    setAmenityFormModalState,
    selectedAmenity,
    amenityQuery,
  } = useGlobalStore();

  const { refetch } = amenityQuery();

  const formSchema = z.object({
    Label: z.string().min(1, "Required"),
    Description: z.string().min(1, "Required"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    values: {
      Label: selectedAmenity.Label || "",
      Description: selectedAmenity.Description || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { res: data, error } = await editAmenity(
        selectedAmenity.Id,
        values.Label,
        values.Description,
      );

      if (error) throw new Error("Error");

      return data;
    },
    onSuccess: (data) => {
      toast.success(genI18n.success, {
        description: amenityI18n.amenityUpdateSuccess,
      });
      refetch();
      setAmenityFormModalState(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { res: data, error } = await addAmenity(
        values.Label,
        values.Description,
      );

      if (error) throw new Error("Error");

      return data;
    },
    onSuccess: (data) => {
      toast.success(genI18n.success, {
        description: amenityI18n.amenityAddSuccess,
      });
      refetch();
      setAmenityFormModalState(false);
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.message);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    selectedAmenity.Label
      ? mutation.mutate(values)
      : addMutation.mutate(values);
  }

  return (
    <Dialog
      open={amenityFormModalState}
      onOpenChange={(open) => {
        setAmenityFormModalState(open);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {selectedAmenity.Label
              ? amenityI18n.editAmenity
              : amenityI18n.addAmenity}
          </DialogTitle>
          <DialogDescription>
            {selectedAmenity.Label
              ? amenityI18n.amenityEditDesc
              : amenityI18n.amenityAddDesc}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              name="Label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{genI18n.label}</FormLabel>
                  <Input placeholder={genI18n.label} {...field} />
                  <FormDescription>
                    {amenityI18n.amenityLabelDesc}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            <FormField
              name="Description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{genI18n.description}</FormLabel>
                  <Input placeholder={genI18n.description} {...field} />
                  <FormDescription>
                    {amenityI18n.amenityDescriptionDesc}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            <DialogFooter>
              <Button type="submit" variant="default">
                {selectedAmenity.Label ? genI18n.update : genI18n.add}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
