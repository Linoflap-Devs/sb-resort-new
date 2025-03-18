"use client";
import { FilterX, Plus } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useGlobalStore } from "@/store/useGlobalStore";
import SelectComponent from "@/components/SelectComponent";

type DiscountControllerProps = {
  role: number;
};

export function DiscountsController({ role }: DiscountControllerProps) {
  const {
    setSelectedDiscountsFilter,
    selectedDiscountsFilter,
    roomTypeOptionsQuery,
    resetSelectOptState,
    setDiscountFormModalState,
    discountFormModalState,
    selectedDiscountData,
    setSelectedDiscountData,
  } = useGlobalStore();
  const { data: RoomTypeOption } = roomTypeOptionsQuery();
  return (
    <div>
      <div className="flex w-full flex-row items-center justify-between gap-2 border-b border-cstm-border px-4 py-3">
        <div className="flex w-full items-center gap-4">
          <SelectComponent
            options={RoomTypeOption || []}
            placeholder="Select Room Type"
            setState={setSelectedDiscountsFilter}
            state={selectedDiscountsFilter}
          />
          <Button
            onClick={resetSelectOptState}
            className="flex items-center gap-2 bg-cstm-primary text-cstm-tertiary"
          >
            <FilterX size={20} />
          </Button>
        </div>
        <div>
          {role !== 1 && (
            <Button
              className="flex items-center gap-2 bg-cstm-primary text-cstm-tertiary"
              onClick={() => {
                setDiscountFormModalState(true);
                setSelectedDiscountData({} as any);
                console.log(selectedDiscountData);
              }}
            >
              <Plus />
              Add Discount
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
