"use client";
import RoomRatesController from "../RoomRatesController";
import RoomRatesModal from "../RoomRatesModal";
import RoomRatesTable from "../RoomRatesTable";

export default function page() {
  return (
    <div>
      <RoomRatesModal />
      <RoomRatesController />
      <RoomRatesTable />
    </div>
  );
}
