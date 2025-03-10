import React from "react";
import BedTypeController from "./BedTypeController";
import BedTypeModal from "./BedTypeModal";
import BedTypeTable from "./BedTypeTable";

const page = () => {
  return (
    <div>
      <BedTypeController />
      <BedTypeModal />
      <BedTypeTable />
    </div>
  );
};

export default page;
