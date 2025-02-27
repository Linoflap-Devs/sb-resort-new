"use client";
import { useRouter } from "next/navigation";
import { Filter, FilterX, Plus } from "lucide-react";
import * as React from "react";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { useGlobalStore } from "@/store/useGlobalStore";
import SelectComponent from "@/components/SelectComponent";
import { useTranslation } from "next-export-i18n";

export default function RoomRatesController() {
  const { t } = useTranslation();
  const locale = t("locale");
  const roomsI18n = t("RoomsPage");
  const {
    rateFormModalState,
    setRateFormModalState,
    roomTypeOptionsQuery,
    localeFns,
    selectedRoomRateRoomTypeFilter,
    setSelectedRoomRateRoomTypeFilter,
    resetSelectOptState,
    setSelectedRateData,
  } = useGlobalStore();

  /*   const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(2025, 0, 20), 20),
  }); */

  const { data: RoomTypeOption } = roomTypeOptionsQuery();

  return (
    <div className="flex w-full flex-row items-center justify-between gap-2 border-b border-cstm-border px-4 py-3">
      <div className="flex w-full items-center gap-4">
        {/* <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start border-cstm-secondary text-left font-normal",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y", {
                      locale: localeFns[locale],
                    })}{" "}
                    -{" "}
                    {format(date.to, "LLL dd, y", {
                      locale: localeFns[locale],
                    })}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="border-1.5 w-auto border-cstm-secondary p-0"
            align="start"
          >
            <Calendar
              initialFocus
              mode="range"
              locale={localeFns[locale]}
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover> */}
        <SelectComponent
          options={RoomTypeOption}
          valueType="label"
          placeholder={roomsI18n.selectRoomType}
          setState={setSelectedRoomRateRoomTypeFilter}
          state={selectedRoomRateRoomTypeFilter}
        />
        <Button
          onClick={() => {
            //reset selected filter to empty string, since the parameter is a string.
            setSelectedRoomRateRoomTypeFilter("");
            resetSelectOptState();
          }}
          className="flex items-center gap-2 bg-cstm-primary text-cstm-tertiary"
        >
          <FilterX size={20} />
        </Button>
      </div>
      <Button
        className="flex items-center gap-2 bg-cstm-secondary text-cstm-tertiary"
        onClick={() => {
          setSelectedRateData(null); // Add this line to reset the selected rate data
          setRateFormModalState(true);
        }}
      >
        <Plus size={16} />
        {"Add Room Rates"}
      </Button>
    </div>
  );
}
