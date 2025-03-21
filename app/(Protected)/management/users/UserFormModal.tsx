"use client";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGlobalStore } from "@/store/useGlobalStore";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { isEmptyObj } from "@/utils/Helpers";
import SelectComponent from "@/components/SelectComponent";
import { addUser } from "@/app/ServerAction/manage.action";
export default function UserFormModal() {
  const { userFormModalState, setUserFormModalState, usersQuery } =
    useGlobalStore();
  const roles = [
    {
      label: "FRONTDESK",
      value: "1",
    },
    {
      label: "SUPERVISOR",
      value: "2",
    },
    {
      label: "SUPERADMIN",
      value: "3",
    },
  ];
  const { refetch } = usersQuery();

  const formSchema = z
    .object({
      email: z.string().email().min(1, { message: "Please enter an email" }),
      firstName: z.string().min(1, { message: "Please select payment method" }),
      lastName: z.string().min(1, { message: "Please enter Last Name" }),
      roleId: z.string().min(1, { message: "Please select Role" }),
      confirmPassword: z
        .string()
        .min(7, { message: "Enter Confirm Password, at least 7 characters" }),
      password: z
        .string()
        .min(7, { message: "Enter Password, at least 7 characters" }),
    })
    .refine(({ confirmPassword, password }) => confirmPassword === password, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      roleId: "",
      email: "",
      firstName: "",
      lastName: "",
      confirmPassword: "",
      password: "",
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await addUser(data);
      if (!res.success) throw new Error();
      return res;
    },
    onSuccess: (data) => {
      toast.success("Success", {
        description: "Guest Added Successfully",
      });
      refetch();
    },
    onError: (error) => {
      toast.error("Failed", {
        description: "There was an error in the server, please try again",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    addMutation.mutate(data);
  };

  return (
    <Dialog
      open={userFormModalState}
      onOpenChange={(open) => {
        form.reset();
        setUserFormModalState(open);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Please fill out the form to add a new user
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-1" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Email</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <Input type="text" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <Input type="text" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <SelectComponent
                    className="w-full"
                    placeholder="Select Role"
                    setState={field.onChange}
                    state={field.value}
                    options={roles}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-row gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <Input type="password" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <Input type="password" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button className="mt-4 bg-cstm-secondary" type="submit">
                Add New User
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
