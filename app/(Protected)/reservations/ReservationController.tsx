"use client";
import { CalendarIcon, Filter, FilterX, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import SelectComponent from "@/components/SelectComponent";
import { useState } from "react";
import { useGlobalStore } from "@/store/useGlobalStore";
import { useTranslation } from "next-export-i18n";
import { useQuery } from "@tanstack/react-query";
import { getReservationStatusOptions } from "@/app/ServerAction/reservations.action";
import { MainOptions, Reservation } from "@/types";
export default function ReservationController() {
  const { t } = useTranslation();
  const reservationI18n = t("ReservationsPage");
  const {
    roomTypeOptionsQuery,
    setReservationFormModalState,
    reservationFilterRoomTypeOpt,
    reservationFilterStatusOpt,
    setReservationFilterRoomTypeOpt,
    setSelectedReservationData,
    setReservationFilterStatusOpt,
    resetSelectOptState,
    addReservationModalState,
    setAddReservationModalState,
  } = useGlobalStore();
  const { data: RoomTypeOption } = roomTypeOptionsQuery();
  console.log("RoomTypeOption:", RoomTypeOption);
  const { data } = useQuery({
    queryKey: ["GetReservationStatusOpt"],
    queryFn: async () =>
      (await getReservationStatusOptions()).res as MainOptions[],
  });

  console.log("Selected Room Type Filter:", reservationFilterRoomTypeOpt);
  return (
    <div className="flex w-full flex-row items-center justify-between gap-2 border-b border-cstm-border px-4 py-3">
      <div className="flex w-full items-center gap-4">
        <SelectComponent
          state={reservationFilterRoomTypeOpt}
          setState={setReservationFilterRoomTypeOpt}
          options={RoomTypeOption}
          placeholder="Select Room Type"
          valueType="label"
        />
        <SelectComponent
          className="w-74"
          state={reservationFilterStatusOpt}
          setState={setReservationFilterStatusOpt}
          options={data || []}
          placeholder="Select Reservation Status"
          valueType="label"
        />
        <Button
          onClick={() => resetSelectOptState()}
          className="flex items-center gap-2 bg-cstm-primary text-cstm-tertiary"
        >
          <FilterX size={20} />
        </Button>
      </div>
      <Button
        onClick={() => {
          setAddReservationModalState(true);
        }}
      >
        <Plus size={20} />
        {reservationI18n.addReservation}
      </Button>
    </div>
  );
}
