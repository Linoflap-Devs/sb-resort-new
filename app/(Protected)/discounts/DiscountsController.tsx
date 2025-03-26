"use client";
import { Filter, Plus, ChevronDown } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useGlobalStore } from "@/store/useGlobalStore";
import { Checkbox } from "@/components/ui/checkbox";

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
    selectedDiscountData,
    setSelectedDiscountData,
  } = useGlobalStore();

  const { data: RoomTypeOption } = roomTypeOptionsQuery();
  const [open, setOpen] = React.useState(false);
  const [selectedRoomTypes, setSelectedRoomTypes] = React.useState<number[]>([]);

  // Handle room type selection
  const handleRoomTypeChange = (roomTypeId: number) => {
    setSelectedRoomTypes((prevSelected) =>
      prevSelected.includes(roomTypeId)
        ? prevSelected.filter((id) => id !== roomTypeId)
        : [...prevSelected, roomTypeId]
    );
  };

  const applyFilters = () => {
    setSelectedDiscountsFilter(selectedRoomTypes);
    setOpen(false);
  };

  return (
    <div className="flex w-full items-center gap-4 mt-4 px-5">
      {/* Room Type Selector */}
      <div className="relative">
        <Button
          className="flex items-center gap-2 bg-white text-black border border-gray px-4 py-2 rounded-md shadow-sm"
          onClick={() => {
            setOpen((prev) => !prev);
          }}
        >
          {selectedRoomTypes.length > 0
            ? RoomTypeOption.filter((option: { value: any; }) => selectedRoomTypes.includes(Number(option.value)))
              .map((option: { label: any; }) => option.label)
              .join(", ")
            : "Select Room Type"}
          <ChevronDown size={16} />
        </Button>
        {open && (
          <div className="absolute top-full mt-2 w-60 bg-white border rounded-lg shadow-md p-2 z-50">
            {RoomTypeOption?.length > 0 ? (
              <div className="max-h-60 overflow-y-auto">
                {RoomTypeOption.map((option: { value: any; label: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | React.PromiseLikeOfReactNode | null | undefined; }, index: any) => {
                  const roomTypeId = Number(option.value);

                  return (
                    <label
                      key={roomTypeId}
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer rounded-md"
                    >
                      <Checkbox
                        checked={selectedRoomTypes.includes(roomTypeId)}
                        onCheckedChange={() => handleRoomTypeChange(roomTypeId)}
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">No Room Types Available</p>
            )}
          </div>
        )}
      </div>
      {/* Filter & Clear Buttons */}
      <div className="flex gap-2">
        <Button
          className="flex items-center gap-2 bg-cstm-primary text-cstm-tertiary"
          onClick={applyFilters}
        >
          <Filter size={20} />
        </Button>
        <Button
          className="bg-red-500 text-white px-4 py-2 rounded-md"
          onClick={() => {
            resetSelectOptState();
            setSelectedRoomTypes([]);
          }}
        >
          Clear
        </Button>
      </div>

      {/* Add Discount Button */}
      {role !== 1 && (
        <div className="ml-auto">
          <Button
            className="flex items-center gap-2 bg-cstm-primary text-cstm-tertiary"
            onClick={() => {
              setDiscountFormModalState(true);
              setSelectedDiscountData({} as any);
            }}
          >
            <Plus />
            Add Discount
          </Button>
        </div>
      )}
    </div>

  );
}
