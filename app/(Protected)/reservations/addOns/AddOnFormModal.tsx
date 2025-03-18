"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGlobalStore } from "@/store/useGlobalStore";
import { useMutation } from "@tanstack/react-query";

import { commafy, isEmptyObj } from "@/utils/Helpers";
import { addAddOn, editAddOn } from "@/app/ServerAction/reservations.action";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import SelectComponent from "@/components/SelectComponent";

export default function AddOnFormModal() {
  const {
    addOnModalState,
    setAddOnModalState,
    selectedAddOnData,
    addOnTypeQuery,
    addOnQuery,
  } = useGlobalStore();
  const isEditMode = !isEmptyObj(selectedAddOnData);
  const { refetch } = addOnQuery();
  const { mutate: addMutate } = useMutation({
    mutationKey: ["AddAddOn"],
    mutationFn: async (value: any) => {
      const res = await addAddOn(value);
      if (!res.success) throw new Error();
      return res;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "Successfully Added an Add-on",
      });
      setAddOnModalState(false);
      refetch();
    },
    onError: () => {
      toast.error("Error", {
        description: "There was an error, please try again",
      });
    },
  });
  const { mutate: editMutate } = useMutation({
    mutationKey: ["editAddOn"],
    mutationFn: async (value: any) => {
      const res = await editAddOn({ Id: selectedAddOnData?.Id, ...value });
      if (!res.success) throw new Error();
      return res;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "Successfully Edited an Add-on",
      });
      setAddOnModalState(false);
      refetch();
    },
    onError: () => {
      toast.error("Error", {
        description: "There was an error, please try again",
      });
    },
  });

  const { data } = addOnTypeQuery();

  const formScheme = z.object({
    AddOnName: z.string().min(1, { message: "Required" }),
    Price: z.string().min(1, { message: "Required" }),
    AddOnTypeId: z.string().min(1, { message: "Required" }),
  });

  const form = useForm({
    resolver: zodResolver(formScheme),
    values: {
      AddOnName: isEditMode ? selectedAddOnData?.AddOnName : "",
      Price: isEditMode ? selectedAddOnData?.Price.toString() : "",
      AddOnTypeId: isEditMode ? selectedAddOnData?.AddOnTypeId.toString() : "",
    },
  });

  function onSubmit(data: any) {
    isEditMode ? editMutate(data) : addMutate(data);
  }

  return (
    <Dialog
      open={addOnModalState}
      onOpenChange={(val) => {
        form.reset();
        setAddOnModalState(val);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Add-on" : "Add Add-on"}</DialogTitle>
          <DialogDescription className="text-md">
            {isEditMode
              ? "Please complete the form to edit an add-on"
              : "Please complete the form to add an add-on."}
          </DialogDescription>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form className="space-y-1" onSubmit={form.handleSubmit(onSubmit)}>
              {/* Change to ComboBox */}
              <FormField
                control={form.control}
                name="AddOnName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <Input {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <Input type="number" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="AddOnTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Add-on Type</FormLabel>
                    <SelectComponent
                      className="w-full"
                      state={field.value}
                      setState={field.onChange}
                      placeholder="Select Add-on Type"
                      options={data}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button className="mt-3 bg-cstm-secondary" type="submit">
                  {isEditMode ? "Update" : "Add Add-on"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
