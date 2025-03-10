"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { addBedType, editBedType } from "@/app/ServerAction/rooms.action";
import { useGlobalStore } from "@/store/useGlobalStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "next-export-i18n";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function BedTypeModal() {
  const { t } = useTranslation();
  const locale = t("locale");
  const roomsI18n = t("RoomsPage");
  const genI18n = t("general");

  const {
    bedTypeFormModalState,
    setBedTypeFormModalState,
    selectedBedType,
    bedTypeQuery,
  } = useGlobalStore();

  const { refetch } = bedTypeQuery();

  const formSchema = z.object({
    TypeName: z.string().min(1, "Required"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      TypeName: selectedBedType.TypeName || "",
    },
  });

  // Reset the form when the selectedBedType changes.
  useEffect(() => {
    form.reset({
      TypeName: selectedBedType.TypeName || "",
    });
  }, [selectedBedType, form]);

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { res: data, error } = await editBedType(
        selectedBedType.Id,
        values.TypeName,
      );
      if (error) throw new Error("Error");
      return data;
    },
    onSuccess: (data) => {
      toast.success(genI18n.success, {
        description: "Successfully edited bed type",
      });
      refetch();
      setBedTypeFormModalState(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { res: data, error } = await addBedType(values.TypeName);
      if (error) throw new Error("Error");
      return data;
    },
    onSuccess: (data) => {
      toast.success(genI18n.success, {
        description: "Successfully added Bed Type",
      });
      refetch();
      setBedTypeFormModalState(false);
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.message);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    selectedBedType.TypeName
      ? mutation.mutate(values) // Editing
      : addMutation.mutate(values); // Adding
  }

  return (
    <Dialog
      open={bedTypeFormModalState}
      onOpenChange={(open) => {
        setBedTypeFormModalState(open);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {selectedBedType.TypeName ? "Edit Bed Type" : "Add Bed Type"}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {selectedBedType.TypeName
            ? "Editing bed type"
            : "Adding a new bed type"}
        </DialogDescription>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              name="TypeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type Name</FormLabel>
                  <Input placeholder="Type Name" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" variant="default">
                {selectedBedType.TypeName ? genI18n.update : genI18n.save}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
