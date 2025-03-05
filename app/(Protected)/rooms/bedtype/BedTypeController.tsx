"use client";

import SelectComponent from "@/components/SelectComponent";
import { Button } from "@/components/ui/button";
import { useGlobalStore } from "@/store/useGlobalStore";
import { FilterX, Plus } from "lucide-react";
import { useTranslation } from "next-export-i18n";
import React, { useEffect } from "react";

type BedTypeOptionType = {
  label: string;
  value: string;
};

export default function BedTypeController() {
  const { t } = useTranslation();
  const locale = t("locale");
  const roomsI18n = t("RoomsPage");

  const {
    bedTypeOptionsQuery,
    selectedBedTypeFilter,
    setSelectedBedTypeFilter,
    resetSelectOptState,
    setSelectedBedType,
    setBedTypeFormModalState,
  } = useGlobalStore();

  useEffect(() => {
    // Reset filter state on mount
    setSelectedBedTypeFilter("");
    resetSelectOptState();
  }, [setSelectedBedTypeFilter, resetSelectOptState]);

  const { data: BedTypeOption } = bedTypeOptionsQuery();

  const uniqueBedTypeOptions = React.useMemo(() => {
    if (!BedTypeOption) return [];
    const seenLabels = new Set();
    return BedTypeOption.filter((option: BedTypeOptionType) => {
      if (seenLabels.has(option.label)) {
        return false;
      }
      seenLabels.add(option.label);
      return true;
    });
  }, [BedTypeOption]);

  return (
    <div className="flex w-full flex-row items-center justify-between gap-2 border-b border-cstm-border px-4 py-3">
      <div className="flex w-full items-center gap-4">
        <SelectComponent
          options={uniqueBedTypeOptions}
          valueType="label"
          placeholder="Select Bed Type"
          setState={setSelectedBedTypeFilter}
          state={selectedBedTypeFilter}
        />
        <Button
          className="flex items-center gap-2 bg-cstm-primary text-cstm-tertiary"
          onClick={() => {
            setSelectedBedTypeFilter("");
            resetSelectOptState();
          }}
        >
          <FilterX size={20} />
        </Button>
      </div>
      <Button
        className="flex items-center gap-2 bg-cstm-secondary text-cstm-tertiary"
        onClick={() => {
          setSelectedBedType({} as any);
          setTimeout(() => {
            setBedTypeFormModalState(true);
          }, 100);
        }}
      >
        <Plus size={16} />
        {"Add Bed Type"}
      </Button>
    </div>
  );
}
