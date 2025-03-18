"use client";
import { getAddOnsTypeOpt } from "@/app/ServerAction/reservations.action";
import SelectComponent from "@/components/SelectComponent";
import { Button } from "@/components/ui/button";
import { useGlobalStore } from "@/store/useGlobalStore";
import { useQuery } from "@tanstack/react-query";
import { FilterX, Plus } from "lucide-react";
import React from "react";

export default function AddOnController() {
  const {
    addOnFilterType,
    setAddOnFilterType,
    setAddOnModalState,
    addOnTypeQuery,
    setSelectedAddOnData,

    resetSelectOptState,
  } = useGlobalStore();

  const { data } = addOnTypeQuery();

  return (
    <div className="flex w-full flex-row items-center justify-between gap-2 border-b border-cstm-border px-4 py-3">
      <div className="flex gap-2">
        <SelectComponent
          state={addOnFilterType}
          setState={setAddOnFilterType}
          valueType="label"
          placeholder="Sort Types"
          options={data}
        />
        <Button onClick={resetSelectOptState}>
          <FilterX />
        </Button>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => {
            setSelectedAddOnData({});
            setAddOnModalState(true);
          }}
        >
          <Plus /> Add-on
        </Button>
      </div>
    </div>
  );
}
