"use client";
import { FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "next-export-i18n";
import { useGlobalStore } from "@/store/useGlobalStore";
import SelectComponent from "@/components/SelectComponent";

export default function BillingsController() {
  const { t } = useTranslation();
  const locale = t("locale");
  const {
    localeFns,
    selectedBillingStatusFilter,
    setSelectedBillingStatusFilter,
    selectedBillingReservationStatusFilter,
    setSelectedBillingReservationStatusFilter,
    resetSelectOptState,
  } = useGlobalStore();
  console.log("Selected Billing Status Filter:", selectedBillingStatusFilter);
  return (
    <div className="flex w-full flex-row items-center justify-between gap-2 border-b border-cstm-border px-4 py-3">
      <div className="flex gap-4">
        {/* <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !selectedBillingDateFilter && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedBillingDateFilter ? format(selectedBillingDateFilter, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedBillingDateFilter as Date}
              onSelect={setSelectedBillingDateFilter}
              initialFocus
            />
          </PopoverContent>
        </Popover> */}
        <SelectComponent
          state={selectedBillingStatusFilter}
          setState={setSelectedBillingStatusFilter}
          options={[
            {
              label: "Fully Paid",
              value: "1",
            },
            {
              label: "Deposit Paid",
              value: "2",
            },
            {
              label: "Unpaid",
              value: "3",
            },
          ]}
          placeholder="Billing Status"
          valueType="label"
        />

        <SelectComponent
          state={selectedBillingReservationStatusFilter}
          setState={setSelectedBillingReservationStatusFilter}
          options={[
            {
              label: "Checked-In",
              value: "Checked-In",
            },
            {
              label: "Done",
              value: "Done",
            },
          ]}
          placeholder="Reservation Status"
          valueType="label"
        />

        <Button>
          <FilterX
            onClick={() => {
              console.log("Reset button clicked!");
              resetSelectOptState();
            }}
          />
        </Button>
      </div>
    </div>
  );
}
