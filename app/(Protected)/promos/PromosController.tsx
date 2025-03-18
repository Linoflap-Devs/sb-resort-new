"use client";
import { FilterX, Plus } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useGlobalStore } from "@/store/useGlobalStore";
import SelectComponent from "@/components/SelectComponent";

type PromosControllerProps = {
  role: number;
};

export default function PromosController({ role }: PromosControllerProps) {
  const {
    setSelectedPromoData,
    setPromosFormModalState,
    roomTypeOptionsQuery,
    selectedRoomTypePromosFilter,
    setSelectedRoomTypePromosFilter,
    resetSelectOptState,
  } = useGlobalStore();

  const { data: RoomTypeOption } = roomTypeOptionsQuery();

  return (
    <div className="flex w-full flex-row items-center justify-between gap-2 border-b border-cstm-border px-4 py-3">
      <div className="flex w-full items-center gap-4">
        <SelectComponent
          options={RoomTypeOption || []}
          placeholder="Select Room Type"
          setState={setSelectedRoomTypePromosFilter}
          state={selectedRoomTypePromosFilter}
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
              setSelectedPromoData({});
              setPromosFormModalState(true);
            }}
          >
            <Plus />
            Add Promo Rate
          </Button>
        )}
      </div>
    </div>
  );
}
