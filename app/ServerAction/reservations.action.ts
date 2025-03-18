"use server";
import { createClient } from "@/utils/supabase/server";
import { bigint } from "zod";

const supabase = createClient();

export async function checkReferenceNumber(referenceNumber: string) {
  const { data, error } = await supabase
    .from("Reservations")
    .select("Id")
    .eq("Id", referenceNumber);
  if (error) {
    console.log(error);
    return { success: false, res: data, error: error.message };
  }
  return { success: true, res: data };
}

export async function getReservationStatusOptions() {
  const { data, error } = await supabase
    .from("ReservationStatus")
    .select("label:StatusName, value:Id");
  if (error) {
    console.log(error);
    return { success: false, res: data, error: error.message };
  }
  return { success: true, res: data };
}
export async function getRoomOptions(value: number) {
  const { data, error } = await supabase
    .from("Rooms")
    .select("label:RoomNumber, value:Id")
    .eq("RoomTypeId", value)
    .eq("StatusId", 1).eq("IsDeleted", false);
  if (error) {
    return { success: false, res: data, error: error.message };
  }
  return { success: true, res: data };
}
export async function getReservationDetails(id: string) {
  const { data, error } = await supabase
    .from("Reservations")
    .select(
      `*, 
      ...ReservationStatus(ReservationStatus:StatusName), 
      ...RoomTypes(RoomType:TypeName), 
      ...ReservationType(ReservationType:TypeName), 
      GuestData(FirstName,LastName)`,
    )
    .eq("Id", id);
  if (error) {
    console.log(error);
    return { success: false, res: data, error: error.message };
  }
  return { success: true, res: data };
}
export async function getReservations() {
  const { data, error } = await supabase
    .from("Reservations")
    .select(
      `*, 
      ...ReservationStatus(ReservationStatus:StatusName), 
      ...RoomTypes(RoomType:TypeName), 
      ...ReservationType(ReservationType:TypeName), 
      GuestData(FirstName,LastName,Email,Contact),
      Discounts(Id, DiscountName, DiscountCode, DiscountType, DiscountValue)`,
    ).eq("IsDeleted", false)
    .order("StatusId", { ascending: true })
    .order("CreatedAt", { ascending: false })
  if (error) {
    console.log(error);
    return { success: false, res: data, error: error.message };
  }
  return { success: true, res: data };
} 
export async function getReservation(id: string) {
  const { data, error } = await supabase
    .from("Reservations")
    .select(
      `*, 
      ...ReservationStatus(ReservationStatus:StatusName), 
      ...RoomTypes(RoomType:TypeName), 
      ...ReservationType(ReservationType:TypeName), 
      GuestData(*),
      Discounts(Id, DiscountName, DiscountCode, DiscountType, DiscountValue)`)
    .eq("IsDeleted", false)
    .eq("Id", id)
    .single();

  if (error) {
    console.log(error);
    return { success: false, res: {}, error: error.message };
  }
  console.log(data)
  return { success: true, res: data };
}

export async function addReservationsLobby(values: any) {
  console.log(values)
  const {
    RoomCount,
    dateRange: { from: CheckInDate, to: CheckOutDate },
    ExtraChild,
    ExtraAdult,
    RoomTypeId,
  } = values;
  const { data, error } = await supabase.from("Reservations").insert({
    CheckInDate: CheckInDate,
    CheckOutDate: CheckOutDate,
    ReservationTypeId: 2,
    StatusId: 2,
    RoomTypeId,
    RoomCount,
    ExtraChild,
    ExtraAdult,
    GuestId: null,
  });
  if (error) {
    console.log(error);
    return { success: false, res: error.message };
  }
  return { success: true, res: data };
}

export async function checkPromoCode(rate: string) {
  console.log(rate)
  const { data, error } = await supabase
    .from("Promos")
    .select("*")
    .eq("PromoDetailId", rate)
    .single()
  
  if(error) {
    return { success: false, res: error.message }
  }
  return { success: true, res: data };
}
export async function deleteReservation(values: any) {
  const { data, error } = await supabase
    .from("Reservations")
    .update({ IsDeleted: true })
    .eq("Id", values);
  if (error) {
    console.log(error);
    return { success: false, res: error.message };
  }
  return { success: true, res: data };
}
export async function editReservations(values: any) {
  const {
    RoomCount,
    dateRange: { from: CheckInDate, to: CheckOutDate },
    ExtraChild,
    ExtraAdult,
    RoomTypeId,
    Id,
    Remarks
  } = values;
  const { data, error } = await supabase
    .from("Reservations")
    .update({
      CheckInDate: CheckInDate,
      CheckOutDate: CheckOutDate,
      RoomTypeId,
      RoomCount,
      ExtraChild,
      ExtraAdult,
      Remarks
    })
    .eq("Id", Id);
  if (error) {
    console.log(error);
    return { success: false, res: error.message };
  }
  return { success: true, res: data };
}
export async function editReservationStatus(id: string, statusId: number) {
  const { data, error } = await supabase
    .from("Reservations")
    .update({ StatusId: statusId })
    .eq("Id", id);
  if (error) {
    console.log(error);
    return { success: false, res: error.message };
  }
  return { success: true, res: data };
}

export async function editReservationRemark(id: string, remark?: string){
  const {data, error} = await supabase
    .from("Reservations")
    .update({ Remarks: remark })
    .eq("Id", id);

  if(error){
    console.log(error);
    return { success: false, res: error.message };
  }
  return { success: true, res: data };
}

export async function getBillings() {
  const { data, error } = await supabase
    .from("billingsview")
    .select(`*`);
  if (error) {
    console.log(error);
    return { success: false, res: error.message };
  }
  return { success: true, res: data };
}
export async function getBillingDetails(id: number) {
  const { data, error } = await supabase
    .from("BillingDetails")
    .select("Id,BillingId,AddOnCount,AddOnId,...AddOns(AddOnName,Price)")
    .eq("BillingId", id);
  if (error) {
    console.log(error);
    return { success: false, res: data };
  }
  return { success: true, res: data };
}
export async function getBillingRoomDetails(id: string) {
  const { data, error } = await supabase
    .from("BillingRoomDetails")
    .select("*")
    .eq("BillingId", id);
  if (error) {
    console.log(error);
    return { success: false, res: error.message };
  }
  return { success: true, res: data };
}
export async function addBillings(values: any) {
  const { data, error } = await supabase.rpc("add_billings2", {
    reservationid: values.ReservationId,
    roomnumbers: values.RoomNumbers,
    initialbill: values.InitialBill,
    deposit: values.Deposit,
  });

  if (error ) {
    console.log(error);
    return { success: false, res: error.message };
  }

  return { success: true, res: data };
}
export async function processBillingAddOns(values: any, billingId: number) {
  const { data, error } = await supabase.rpc("process_billing_addons", {
    json_array: values,
    billing_id: billingId
  })
  if (error) {
    console.log(error);
    return { success: false, res: data };
  }
  return { success: true, res: data };
}
export async function finalizeBill(id: number) {
  const { data, error } = await supabase
    .rpc("finalize_bill",
      { billing_id: id })
  if (error) {
    console.log(error);
    return { success: false, res: data };
  }
  console.log(data);
  return { success: true, res: data };
}
export async function getAddOns() {
  const { data, error } = await supabase
    .from("AddOns")
    .select("*,...AddOnTypes(AddOnType:TypeName) ")
    .eq("IsDeleted", false);
  if (error) {
    console.log(error);
    return { success: false, res: error.message };
  }
  return { success: true, res: data };
}
export async function getAddOnsOpt(selectedOption: any) {
  const { data, error } = await supabase
    .from("AddOns")
    .select("value:Id, label:AddOnName,Price")
    .not('Id', 'in', selectedOption)
  if (error) {
    console.log(error);
    return { success: false, res: data };
  }
  return { success: true, res: data };
}
export async function getAddOnsTypeOpt() {
  const { data, error } = await supabase
    .from("AddOnTypes")
    .select("value:Id, label:TypeName")
  if (error) {
    console.log(error);
    return { success: false, res: error.message };
  }
  return { success: true, res: data };
}
export async function addAddOn(value: any) {
  const { data, error } = await supabase
    .from("AddOns")
    .insert({
      AddOnName: value.AddOnName,
      Price: value.Price,
      AddOnTypeId: value.AddOnTypeId,
    });
  if (error) {
    console.log(error);
    return { success: false, res: error.message };
  }
  return { success: true, res: data };
}
export async function editAddOn(value: any) {
  const { data, error } = await supabase
    .from("AddOns")
    .update({
      AddOnName: value.AddOnName,
      Price: value.Price,
      AddOnTypeId: value.AddOnTypeId,
    }).eq("Id", value.Id)
  if (error) {
    console.log(error);
    return { success: false, res: error.message };
  }
  return { success: true, res: data };
}
export async function deleteAddOn(value: any) {
  const { data, error } = await supabase
    .from("AddOns")
    .update({ IsDeleted: true })
    .eq("Id", value)
  if (error) {
    console.log(error);
    return { success: false, res: error.message };
  }
  return { success: true, res: data };
}
export async function getBillingStatusOptions() {
  const { data, error } = await supabase
    .from("BillingStatus")
    .select("value:Id, label:StatusName")
  if (error) {
    console.log(error);
    return { success: false, res: error.message };
  }
  return { success: true, res: data };
}

export async function getReservationSummary() {
  const { data, error } = await supabase
    .from("reservationsummary1")
    .select('*')
  if (error) {
    console.log(error);
    return { res: error.message };
  }
  return { res: data };
}

/* Public */
export async function addOnlineReservation(
  firstname: string,
  lastname: string,
  birthdate: Date,
  email: string,
  contact: string,
  nationality: string,
  roomcount: number,
  roomtypeid: number,
  checkindate: Date,
  checkoutdate: Date,
  extrachild: number,
  extraadult: number,
  roomrateid: number,
  devicetypeid: number,
  country: string,
  request: string,
  discountid: number | null,
  address1: string,
  address2: string | null,
  city: string,
  province: string, 
  zipcode: string,
  adultguests: number,
  childguests: number,
  reservationtypeid: number,
) {
  const { data, error } = await supabase.rpc("create_client_reservation_6",
    { firstname, lastname, birthdate, email, contact, nationality, roomcount, roomtypeid, checkindate, checkoutdate, extrachild, extraadult, roomrateid, devicetypeid, country, request, discountid, address1, address2, city, province, zipcode, adultguests, childguests, reservationtypeid });

  if (error) {
    console.log(error);
    return { success: false, res: error.message };
  }
  console.log(data)
  return { success: true, res: data };

}

export async function checkReservation(id: number) {
  const { data, error } = await supabase
    .from("Reservations")
    .select("CreatedAt, CheckInDate, CheckOutDate, ...GuestData(FirstName, LastName),...RoomTypes(TypeName)")
    .eq("Id", id)
    .single()

  console.log(data)

  if (error) throw new Error(error.message);

  return { success: true, res: data };
}

export async function peekLastReservation() {
  const { data, error } = await supabase
    .from("Reservations")
    .select("*")
    .order("Id", { ascending: false })
    .limit(1);
  if (error) {
    console.log(error);
    return { success: false, res: error.message };
  }
  return { success: true, res: data };
}

export async function getAssignedRoom(reservationId: number){
  const {data, error} = await supabase
    .from('assigned_rooms')
    .select('*')
    .eq('ReservationId', reservationId)
  if(error){
    console.log(error)
    return {success: false, res: []}
  }
  return {success: true, res: data}
} 

export async function updateCheckInTime(reservationId: number, time: Date){
  const {data, error} = await supabase
    .from('Reservations')
    .update({CheckInActual: time})
    .eq('Id', reservationId)
  if(error){
    console.log(error)
    return {success: false, res: []}
  }
  return {success: true, res: data}
}

export async function updateCheckOutTime(reservationId: number, time: Date){
  const {data, error} = await supabase
    .from('Reservations')
    .update({CheckOutActual: time})
    .eq('Id', reservationId)
  if(error){
    console.log(error)
    return {success: false, res: []}
  }
  return {success: true, res: data}
}
export async function getReservationTypeOptions() {
  const { data, error } = await supabase
    .from("ReservationType")
    .select("label:TypeName, value:Id");
  if (error) {
    console.log(error);
    return { success: false, res: data, error: error.message };
  }
  return { success: true, res: data };
}