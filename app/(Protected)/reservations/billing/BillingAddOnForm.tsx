"use client";
import React, { FormEvent, FormEventHandler, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useGlobalStore } from "@/store/useGlobalStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getAddOnsOpt,
  getBillingDetails,
  processBillingAddOns,
} from "@/app/ServerAction/reservations.action";
import { commafy, isEmptyObj } from "@/utils/Helpers";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronsUpDown, Check, LoaderCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useTranslation } from "next-export-i18n";
import { formatCurrencyJP } from "@/utils/Helpers";
import { set } from "date-fns";
import { prevElementSibling } from "domutils";

interface AddOn {
  value: number;
  label: string;
  Price: number;
  quantity: number;
}

export default function BillingAddOnForm() {
  const [open, setOpen] = useState<boolean>(false);
  const { t } = useTranslation();
  const reservationI18n = t("ReservationsPage");
  const generali18n = t("general");
  const roomsI18n = t("RoomsPage");
  const {
    billingAddOnFormModalState,
    setBillingAddOnFormModalState,
    selectedBillingData,
    billingsQuery,
  } = useGlobalStore();
  const { refetch: refetchBillings } = billingsQuery();

  const {
    data,
    isLoading,
    isFetched,
    refetch: refetchBillingDetails,
  } = useQuery({
    queryKey: ["getBillingDetails", selectedBillingData.Id],
    enabled: !isEmptyObj(selectedBillingData),
    queryFn: async () => {
      const res = await getBillingDetails(selectedBillingData.Id);
      if (!res.success) throw new Error();
      console.log(res.res);
      return res.res;
    },
  });

  const {
    data: AddOnDataOpt,
    isLoading: isAddOnOptLoading,
    refetch: refetchAddOnOpt,
  } = useQuery({
    queryKey: ["GetAddOnsOptions", selectedBillingData.Id],
    enabled: isFetched,
    queryFn: async () => {
      const selectedOpt = data?.map((item) => item.AddOnId);
      const res = await getAddOnsOpt(`(${selectedOpt})`);
      if (!res.success) throw new Error();
      return res.res;
    },
  });

  const { mutate: processBillingAddOnsMutate } = useMutation({
    mutationFn: async (values: any) => {
      const res = await processBillingAddOns(values, selectedBillingData.Id);
      if (!res.success) throw new Error();
      return res.res;
    },
    onSuccess: () => {
      toast.success(generali18n.success, {
        description: "Add on has been added successfully",
      });
    },
    onError: () => {
      toast.success(generali18n.somethingWentWrong, {
        description: "There was an error, please try again",
      });
    },
    onSettled: () => {
      setBillingAddOnFormModalState(false);
      setAddedAddOn([]);
      refetchAddOnOpt();
      refetchBillings();
      refetchBillingDetails();
    },
  });

  const [addedAddOn, setAddedAddOn] = useState<AddOn[]>([]);
  const [addOnTotal, setAddOnTotal] = useState<number>(0);
  const [combinedTotal, setCombinedTotal] = useState<number>(0);
  const [newAddOnsTotal, setNewAddOnsTotal] = useState<number>(0);
  const [combinedAddOns, setCombinedAddOns] = useState<
    (any & { quantity: number })[]
  >([]);

  useEffect(() => {
    if (data) {
      const existingAddOn = data.map((item: any) => ({
        ...item,
        value: item.AddOnId,
        quantity: item.AddOnCount || 1,
      }));
      setCombinedAddOns(existingAddOn);
    }
  }, [data]);

  useEffect(() => {
    setAddOnTotal(selectedBillingData?.TotalPerAddOn || 0);
    console.log(selectedBillingData);
    console.log(addOnTotal);
  }, [selectedBillingData]);

  useEffect(() => {
    const total = addedAddOn.reduce(
      (n, { Price, quantity }) => n + Price * quantity,
      0,
    );
    setNewAddOnsTotal(total);
  }, [addedAddOn]);

  useEffect(() => {
    console.log("combinedAddOns", combinedAddOns);
    const total = combinedAddOns.reduce(
      (n, { Price, quantity }) => n + Price * quantity,
      0,
    );
    setCombinedTotal(total);
  }, [combinedAddOns]);

  const handleQuantityChange = (value: string, itemValue: number) => {
    const quantity = parseInt(value) || 0;
    setCombinedAddOns((prev) =>
      prev.map((item) =>
        item.value === itemValue ? { ...item, quantity } : item,
      ),
    );
  };

  const removeAddOn = (itemValue: number) => {
    setCombinedAddOns((prev) =>
      prev.filter((item: any) => item.value !== itemValue),
    );
  };

  function handleFormSubmit(e: FormEvent) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const formEntries = combinedAddOns.map((item) => ({
      addOnId: item.value,
      addOnCount: item.quantity,
    }));
    // data?.map((addOn: any) => {
    //   formEntries.push({ addOnId: addOn.AddOnId, addOnCount: addOn.AddOnCount });
    // })
    console.log(formData, formEntries);
    processBillingAddOnsMutate(formEntries);
  }

  return (
    <Dialog
      open={billingAddOnFormModalState}
      onOpenChange={(val) => {
        setAddedAddOn([]);
        setBillingAddOnFormModalState(val);
        setNewAddOnsTotal(0);
      }}
    >
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{reservationI18n.addAddOn}</DialogTitle>
          <DialogDescription>{reservationI18n.addAddOnDesc}</DialogDescription>
        </DialogHeader>
        <Popover
          open={open}
          onOpenChange={(value) => {
            setOpen(value);
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between text-black/[.5]"
            >
              {reservationI18n.selectAddOn}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Add Add-on" className="h-9" />
              <CommandList>
                {isAddOnOptLoading ? (
                  <CommandEmpty>Loading...</CommandEmpty>
                ) : (
                  <>
                    <CommandEmpty>No Add-on found.</CommandEmpty>
                    <CommandGroup>
                      {(AddOnDataOpt || []).map((item: any) => (
                        <CommandItem
                          key={item.value}
                          value={item.value}
                          data-value={item}
                          onSelect={(currentValue) => {
                            let exists = combinedAddOns.some(
                              (addOn: any) =>
                                item.value === addOn.value &&
                                item.label === addOn.label &&
                                item.Price === addOn.Price,
                            );
                            console.log(item);
                            if (exists) {
                              console.log(item, "already added");
                            } else {
                              setCombinedAddOns((prev) => [
                                ...prev,
                                { ...item, quantity: 1 },
                              ]);
                              setOpen(false);
                            }
                          }}
                        >
                          {item.label}
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              combinedAddOns.some(
                                (addOn: any) =>
                                  item.value === addOn.value &&
                                  item.label === addOn.label &&
                                  item.Price === addOn.Price,
                              )
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <div>
          <div className="flex items-center border-y bg-black/[.03] py-1">
            <div className="w-2/6 px-2">
              <p className="text-sm font-semibold uppercase text-black/[.8]">
                {reservationI18n.addOns}
              </p>
            </div>
            <div className="w-2/6 px-2">
              <p className="text-right text-sm font-semibold uppercase text-black/[.8]">
                {reservationI18n.unitPrice}
              </p>
            </div>
            <div className="w-2/6 px-2">
              <p className="text-right text-sm font-semibold uppercase text-black/[.8]">
                {reservationI18n.quantity}
              </p>
            </div>
          </div>
          <ScrollArea className="over flex max-h-56 flex-col">
            <form
              id="form"
              onSubmit={handleFormSubmit}
              className="flex flex-col"
            >
              {combinedAddOns.length === 0 && (
                <div className="flex justify-center py-4">
                  <p className="text-cstm-border/50">
                    {reservationI18n.selectAddOn}
                  </p>
                </div>
              )}

              {!isFetched ? (
                <div className="flex items-center justify-center px-1">
                  <LoaderCircle className="animate-spin" />
                </div>
              ) : (
                // data &&
                // data.map((item: any) => (
                //   <div className="flex items-center py-2 border-b text-sm" key={item.Id}>
                //     <label className="w-2/6 px-2 font-semibold">
                //       {item.AddOnName}
                //     </label>
                //     <p className="w-2/6 px-2 text-black/[.6] text-right">₱{formatCurrencyJP(item.Price)}</p>
                //     <p className="w-2/6 px-2 text-black/[.6] text-right">{item.AddOnCount}</p>
                //   </div>
                // ))
                ""
              )}
              {/* {addedAddOn.map((item) => (
                <div className="flex items-center py-2 border-b text-sm" key={item.value}>
                  <label className="w-2/6 px-2 font-semibold">
                      {item.label}
                  </label>
                  <p className="w-2/6 px-2 text-black/[.6] text-right">₱{formatCurrencyJP(item.Price)}</p>
                  <input
                    type="number"
                    name={item.value.toString()}
                    defaultValue="1"
                    minLength={1}
                    className="input-decoration-none w-2/6 px-2 text-right"
                    onChange={(e) => {
                      handleQuantityChange(e.target.value, item.value);
                    }}
                  />
                </div>
              ))} */}
              {combinedAddOns?.map((item) => (
                <div
                  className="flex items-center border-b py-2 text-sm"
                  key={item.value}
                >
                  <label className="w-2/6 px-2 font-semibold">
                    {item.AddOnName || item.label}
                  </label>
                  <p className="w-2/6 px-2 text-right text-black/[.6]">
                    ₱{formatCurrencyJP(item.Price)}
                  </p>
                  <div className="flex w-2/6 items-center justify-end px-2">
                    <button
                      type="button"
                      className="px-2 text-xl text-red-500"
                      onClick={() =>
                        handleQuantityChange(
                          Math.max(item.quantity - 1, 1).toString(),
                          item.value,
                        )
                      }
                    >
                      -
                    </button>

                    <input
                      type="number"
                      name={item.label}
                      value={item.quantity}
                      min={1}
                      className="input-decoration-none w-12 px-2 text-right"
                      onChange={(e) =>
                        handleQuantityChange(e.target.value, item.value)
                      }
                    />

                    <button
                      type="button"
                      className="px-2 text-xl text-green-500"
                      onClick={() =>
                        handleQuantityChange(
                          (item.quantity + 1).toString(),
                          item.value,
                        )
                      }
                    >
                      +
                    </button>

                    <button
                      className="ml-2 text-red-500"
                      onClick={() => removeAddOn(item.value)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </form>
          </ScrollArea>
          <div className="p-2">
            <div className="flex items-center">
              <h1 className="w-5/6 font-bold uppercase">{generali18n.total}</h1>
              <h1 className="w-1/6 text-center font-bold">
                {/* ₱{formatCurrencyJP(addOnTotal + newAddOnsTotal)} */}₱
                {formatCurrencyJP(combinedTotal)}
              </h1>
            </div>
            {/* <div className="flex items-center">
              <h1 className="w-5/6 font-bold">{reservationI18n.initialBill}</h1>
              <h1 className="w-1/6 border-l-2 text-center font-bold">
                {formatCurrencyJP(selectedBillingData.InitialBill + addOnTotal)} 
              </h1>
            </div> */}
          </div>
        </div>
        {/* <Table>
          <TableCaption>Hello</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Add-On</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {data?.length === 0 && addedAddOn.length === 0 && (
                
                  <div className="flex justify-center w-full">
                    <p className="text-cstm-border/50">
                      {reservationI18n.selectAddOn}
                    </p>
                  </div>
              )}
          </TableBody>
        </Table> */}
        <DialogFooter>
          <Button form="form" type="submit">
            {"Add-on"}
          </Button>
          {/* <Button form="form" type="button" onClick={() => console.log(combinedAddOns)}>
           test
          </Button> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
