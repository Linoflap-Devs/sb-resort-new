"use server";

import { RoomAmenityResponse } from "@/types";
import { createClient } from "@/utils/supabase/server";
import { Description } from "@radix-ui/react-dialog";
import { format } from "date-fns";

const supabase = createClient();

/* Rooms */
export async function getRooms() {
  const { data, error } = await supabase
    .from("Rooms")
    .select(
      "Id , RoomNumber, ...RoomTypes(TypeName), RoomTypeId, ...RoomStatus(StatusName), StatusId, CreatedAt",
    )
    .order("CreatedAt", { ascending: false })
    .eq("IsDeleted", false);
  if (error) {
    return { success: false, res: data, error: error.message };
  }
  return { success: true, res: data };
}
export async function addRoom(values: any) {
  const {
    roomNumber: RoomNumber,
    roomType: RoomTypeId,
    status: StatusId,
  } = values;
  const { data, error } = await supabase
    .from("Rooms")
    .insert({ RoomNumber, RoomTypeId, StatusId });
  if (error) {
    return { success: false, res: data, error: error.message };
  }
  // console.log(data);
  return { success: true, res: data };
}
export async function editRoom(values: any) {
  const {
    Id,
    roomNumber: RoomNumber,
    roomType: RoomTypeId,
    status: StatusId,
  } = values;
  const { data, error } = await supabase
    .from("Rooms")
    .update({ RoomNumber, RoomTypeId, StatusId })
    .eq("Id", Id);
  if (error) {
    // console.log(error);
    return { success: false, res: data, error: error.message };
  }
  // console.log(data);
  return { success: true, res: data };
}
export async function deleteRoom(value: any) {
  const { data, error } = await supabase
    .from("Rooms")
    .update({ IsDeleted: true })
    .eq("Id", value);
  if (error) {
    return { success: false, res: data, error: error.message };
  }
  return { success: true, res: data };
}
/* End Of Rooms Server Actions */
/* RoomTypes */
export async function getRoomTypes() {
  const { data, error } = await supabase
    .from("RoomTypes")
    .select("*, Rooms(count), ...BedTypes(BedType:TypeName)", {
      count: "exact",
    })
    .eq("isDeleted", false);
  if (error) {
    console.log(error);
    return { success: false, res: data, error: error.message };
  }
  return { success: true, res: data };
}
export async function getCurrentRoomTypesRate(value: any) {
  const { data, error } = await supabase
    .from("get_current_roomtype_rate")
    .select("*")
    .eq("RoomTypeId", value).limit(1);
  if (error) {
    return { success: false, res: [], error: error.message };
  }
  return { success: true, res: data };
}
export async function addRoomType(values: any) {
  const {
    roomTypeName: roomtypename,
    adultCount: roomtypemaxadult,
    childCount: roomtypemaxchild,
    bedType: bedtypeid,
    baseRoomRate: baseroomrate,
    weekendRoomRate: weekendroomrate,
    extraChildWeekEndRate: weekendextrachildrate,
    extraAdultWeekEndRate: weekendextraadultrate,
    extraChildWeekDayRate: extrachildrate,
    extraAdultWeekDayRate: extraadultrate,
    description: roomtypedescription,
    image_urls: images,
    amenities: amenities
  } = values;

  console.log(values)
  const { data, error } = await supabase.rpc("add_room_type_rpc", {
    baseroomrate: baseroomrate,
    bedtypeid: bedtypeid,
    extraadultrate: extraadultrate,
    extrachildrate: extrachildrate,
    roomtypedescription: roomtypedescription,
    roomtypemaxadult: roomtypemaxadult,
    roomtypemaxchild: roomtypemaxchild,
    roomtypename: roomtypename,
    weekendextraadultrate: weekendextraadultrate,
    weekendroomrate: weekendroomrate,
    weekendextrachildrate: weekendextrachildrate,
  });

  if (error) {
    console.log(error)
    return { success: false, res: data, error: error.message };
  }
  console.log(data)

  console.log(images)

  const { data: imgBind, error: imgError } = await supabase
    .from("RoomTypes")
    .update({ Images: images})
    .eq("Id", data.RoomTypeId);
  
  if(imgError) {
    return { success: false, res: [], error: imgError.message };
  }

  const { data: amenityAssoc, error: amenityError } = await supabase 
    .from("RoomTypeAmenities")
    .insert(
      amenities.map((amenity: any) => ({ RoomTypeId: data.RoomTypeId, AmenityId: amenity }))
    )

    if(amenityError) return {success: false, res: [], error: amenityError.message}

  return { success: true, res: data };
}
export async function getEditValues(value: any = -1) {
  //if (value == -1) return { success: true, res: [] };
  const { data, error } = await supabase
    .from("get_current_roomtype_rate_rpc_1")
    .select("*")
    .eq("RoomTypeId", value).limit(1);
    console.log("editValue fetch: " ,data)
  if (error) {
    return { success: false, res: data, error: error.message };
  }
  return { success: true, res: data };
}

export async function editRoomType(values: any) {
  const {
    RoomTypeId: roomtypeid,
    RoomRateId: roomrateid,
    roomTypeName: roomtypename,
    adultCount: roomtypemaxadult,
    childCount: roomtypemaxchild,
    bedType: bedtypeid,
    baseRoomRate: baseroomrate,
    weekendRoomRate: weekendroomrate,
    extraChildWeekEndRate: weekendextrachildrate,
    extraAdultWeekEndRate: weekendextraadultrate,
    extraChildWeekDayRate: extrachildrate,
    extraAdultWeekDayRate: extraadultrate,
    description: roomtypedescription,
    image_urls: images,
    amenities: amenitiesNew,
    amenitiesOld: amenitiesOld,
  } = values;

  const { data, error } = await supabase.rpc("update_room_details", {
    baseroomrate: baseroomrate,
    bedtypeid: bedtypeid,
    extraadultrate: extraadultrate,
    extrachildrate: extrachildrate,
    roomrateid: roomrateid,
    roomtypedescription: roomtypedescription,
    roomtypeid: roomtypeid,
    roomtypemaxadult: roomtypemaxadult,
    roomtypemaxchild: roomtypemaxchild,
    roomtypename: roomtypename,
    weekendextraadultrate: weekendextraadultrate,
    weekendextrachildrate: weekendextrachildrate,
    weekendroomrate: weekendroomrate,
  });
  if (error) {
    console.log(error);
    return { success: false, res: data, error: error.message };
  }

  const {data: imgBind, error: imgError} = await supabase
    .from("RoomTypes")
    .update({ Images: images})
    .eq("Id", roomtypeid)

  if(imgError) {
    return { success: false, res: [], error: imgError.message };
  }

  console.log(amenitiesNew, amenitiesOld, amenitiesNew == amenitiesOld)
  if(!(amenitiesNew == amenitiesOld)){
    // find new
    const newEntries = amenitiesNew.filter((amenity: any) => !amenitiesOld.includes(amenity))
    const deletedEntries = amenitiesOld.filter((amenity: any) => !amenitiesNew.includes(amenity))
    console.log(newEntries, deletedEntries)
    
    if(newEntries.length > 0) {
      const { data: addAmenity, error: addAmenityError } = await supabase
        .from("RoomTypeAmenities")
        .insert(
          newEntries.map((amenity: number) => ({ RoomTypeId: roomtypeid, AmenityId: amenity }))
        )
    
        if(addAmenityError) console.log(addAmenityError)
    }

    if(deletedEntries > 0) {
      const { data: deleteAmenity, error: deleteAmenityError } = await supabase
        .from("RoomTypeAmenities")
        .delete()
        .in("AmenityId", deletedEntries)
        .eq("RoomTypeId", roomtypeid)
      
      if(deleteAmenityError) console.log(deleteAmenityError)
    }
  }

  return { success: true, res: data };
}
export async function deleteRoomType(value: any) {
  const { data: RoomTypes, error: RoomTypesError } = await supabase
    .from("get_current_roomtype_rate")
/******  a6cd1e1d-d700-4065-8232-1b8045411cda  *******/
    .select("RoomTypeId,RoomRateID")
    .eq("RoomTypeId", value);
  if (RoomTypesError) {
    console.log(RoomTypesError);
    return { success: false, res: RoomTypes, error: RoomTypesError.message };
  }
  console.log(RoomTypes);
  const { data, error } = await supabase
    .from("RoomTypes")
    .update({ isDeleted: true })
    .eq("Id", value);
  if (error) {
    console.log(error);
    return { success: false, res: data, error: error.message };
  }
  return { success: true, res: data };
}
/* End Of RoomTypes */

/* Available Rooms */
export async function getAvailableRooms() {
  const { data, error } = await supabase
    .from("availablerooms")
    .select("*")
    .limit(10);


  return { success: true, res: data };
}
/* End Of Available Rooms */

/* Room Rates */
export async function getRoomRates() {
  const { data, error } = await supabase
    .from("RoomRates")
    .select(
      "*, ...RoomTypes(RoomType:TypeName), ...RoomRateStatus(StatusName), ...RoomRateType(RateType:TypeName)",
    )
    .neq("RateTypeId", 2)
    .neq("isDeleted", true);
  if (error) {
    return { success: false, res: data, error: error.message };
  }
  console.log(data)
  return { success: true, res: data };
}
export async function addRoomRate(values: any) {
  const { validity } = values;
  delete values.validity
  const { data, error } = await supabase.from("RoomRates")
    .insert({
      ...values,
      ValidFrom: validity.from,
      ValidTo: validity.to,
      StatusId: 1
    });
  if (error) {
    console.log(error);
    return { success: false, res: data, error: error.message };
  }
  return { success: true, res: data };
}
export async function editRoomRate(values: any) {
  const { data, error } = await supabase
    .from("RoomRates")
    .update({
      RoomTypeId: values.RoomTypeId,
      RateTypeId: values.RateTypeId,
      ValidFrom: values.validity.from,
      ValidTo: values.validity.to,
      BaseRoomRate: parseInt(values.BaseRoomRate),
      WeekendRoomRate: parseInt(values.WeekendRoomRate),
      ExtraAdultRate: parseInt(values.ExtraAdultRate),
      ExtraChildRate: parseInt(values.ExtraChildRate),
      WeekendExtraAdultRate: parseInt(values.WeekendExtraAdultRate),
      WeekendExtraChildRate: parseInt(values.WeekendExtraChildRate),
    })
    .eq("Id", values.Id);
  if (error) {
    console.log(error);
    return { success: false, res: data, error: error.message };
  }
  return { success: true, res: data };
}

export async function deleteRoomRate(value: any) {
  const { data, error } = await supabase
    .from("RoomRates")
    .update({ isDeleted: true })
    .eq("Id", value);
  if (error) {
    return { success: false, res: data, error: error.message };
  }
  return { success: true, res: data };
}
/* End Of Room Rates */
/* Select Options */
export async function getRoomTypeOptions() {
  const { data, error } = await supabase
    .from("RoomTypes")
    .select("value:Id, label:TypeName")
    .eq('isDeleted', 'false');
  if (error) {
    // console.log(error);
    return { success: false, res: data, error: error.message };
  }
  // console.log(data);
  return { success: true, res: data };
}
export async function getRoomStatusOptions() {
  const { data, error } = await supabase
    .from("RoomStatus")
    .select("value:Id, label:StatusName");
  if (error) {
    // console.log(error);
    return { success: false, res: data, error: error.message };
  }
  // console.log(data);
  return { success: true, res: data };
}
export async function getBedTypeOptions() {
  const { data, error } = await supabase
    .from("BedTypes")
    .select("value:Id, label:TypeName");
  if (error) {
    // console.log(error);
    return { success: false, res: data, error: error.message };
  }
  // console.log(data);
  return { success: true, res: data };
}
export async function getBedTypes(id: number = -1){
  if(id == -1) {
    const { data, error } = await supabase
    .from("BedTypes")
    .select("*")
    .eq("IsDeleted", false);
    if (error) {
      return { success: false, res: error.message, };
    }
    return { success: true, res: data };
  }

  const { data, error } = await supabase
    .from("BedTypes")
    .select("*")
    .eq("Id", id)
    .neq("IsDeleted", true);
  if (error) {
    return { success: false, res: error.message, };
  }
  return { success: true, res: data };
}
export async function addBedType(TypeName: string){
  const {data, error} = await supabase
    .from("BedTypes")
    .insert({ TypeName: TypeName})
    .select()
  
  if(error) {
    console.log(error)
    return { success: false, res: error.message, error: error.message };
  }

  return { success: true, res: data, }
}
export async function deleteBedType(value: any) {
  const { data, error } = await supabase
    .from("BedTypes")
    .update({ IsDeleted: true })
    .eq("Id", value);
  if (error) {
    return { success: false, res: data, error: error.message };
  }
  return { success: true, res: data };
}
export async function editBedType(Id: number, TypeName: string){ 
  const { data, error } = await supabase
    .from("BedTypes")
    .update({ TypeName: TypeName})
    .eq("Id", Id);
  if (error) {
    return { success: false, res: data, error: error.message };
  }
  return { success: true, res: data };
}

export async function getRoomRateTypeOptions() {
  const { data, error } = await supabase
    .from("RoomRateType")
    .select("value:Id, label:TypeName");
  if (error) {
    return { success: false, res: data, error: error.message };
  }
  return { success: true, res: data };

}

export async function uploadImage(file: File) {
  const path =  `${file.name}`

  const { data, error } = await supabase.storage
    .from("images")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false
    })

  if (error) {
    console.log(error)
    return null
  }

  const { data: publicUrl } = await supabase.storage
    .from("images")
    .getPublicUrl(path)

  return publicUrl
}

/* Public Available */
export async function getRoomsTypOptions() {
  const { data, error } = await supabase
    .from("RoomTypes")
    .select("Id, Name:TypeName, BedTypes(*),Description,MaxAdult,MaxChild,Images,Rooms(count)", {
      count: "exact",
    })
    .eq("Rooms.StatusId", 1)
    .neq("isDeleted", true);
  if (error) {
    return { success: false, res: data };
  }
  return { success: true, res: data };
}
export async function getCurrentRoomTypeRate(roomTypeId: any) {
  const { data, error } = await supabase
    .from("get_current_roomtype_rate")
    .select("*")
    .eq("RoomTypeId", roomTypeId).limit(1).single();


  if (error) {
    return { success: false, res: error.message, };
  }
  return { success: true, res: data };
}

export async function getRoomTypeRates() {
  const { data, error } = await supabase
    .from("get_current_roomtype_rate")
    .select("*")
  
    if (error) {
      return { success: false, res: error.message, };
    }
    return { success: true, res: data };
}
export async function getPromoRoomRate(promoCode: any) {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from("Promos")
    .select("*,...RoomRates(*,RoomRateID:Id,RoomType:RoomTypes(*))")
    .eq("PromoCode", promoCode).gte("ExpiredAt", today).single();
  if (error) {
    return { success: false, res: error.message, };
  }
  return { success: true, res: data };
}

export async function getAvailableRoomsRPC(to: Date, from: Date) {
  const { data, error } = await supabase.rpc("get_available_rooms_rpc_", {start_date: from, end_date: to});
  // const {data, error} = await supabase.from('RoomTypes').select('*').eq('isDeleted', 'false')
  if (error) {
    return { success: false, res: error.message, };
  }
  return { success: true, res: data };
}

export async function getAvailableRoomTypeRPC(to: Date, from: Date) {
  const { data, error } = await supabase.rpc("GetAvailableRoomTypes", {usercheckin: from, usercheckout: to});
  // const {data, error} = await supabase.from('RoomTypes').select('*').eq('isDeleted', 'false')
  if (error) {
    console.log(error)
    return { success: false, res: error.message, };
  }
  return { success: true, res: data };
}

export async function getRoomAmenities(roomTypeId: number): Promise<RoomAmenityResponse[]> {
  const { data, error } = await supabase
    .from("RoomTypeAmenities")
    .select("RoomTypeId, Amenities (Id, Label, Description, IsDeleted)")
    .eq("RoomTypeId", roomTypeId)
    
  if (error) {
    throw new Error(error.message);
  }
  console.log(data)
  return data;
}


export async function getAmenities(id: number = -1){
  if(id == -1) {
    const { data, error } = await supabase
    .from("Amenities")
    .select("*")
    .eq("IsDeleted", false);
    if (error) {
      return { success: false, res: error.message, };
    }
    return { success: true, res: data };
  }

  const { data, error } = await supabase
    .from("Amenities")
    .select("*")
    .eq("Id", id)
    .neq("isDeleted", true);
  if (error) {
    return { success: false, res: error.message, };
  }
  return { success: true, res: data };
}

export async function addAmenity(label: string, description: string){
  const {data, error} = await supabase
    .from("Amenities")
    .insert({ Label: label, Description: description })
    .select()
  
  if(error) {
    console.log(error)
    return { success: false, res: error.message, error: error.message };
  }

  return { success: true, res: data, }
}

export async function addAmenityToRoomType(roomTypeId: number, amenityId: number){
  const {data, error} = await supabase
    .from("RoomTypeAmenities")
    .insert({ RoomTypeId: roomTypeId, AmenityId: amenityId })
    .select()

    if (error) {
      return { success: false, res: data, error: error.message, };
    }
    return { success: true, res: data };
}

export async function deleteAmenity(id: number){
  const {data, error} = await supabase
    .from("Amenities")
    .update({IsDeleted: true})
    .eq("Id", id)

    if (error) {
      return { success: false, res: error.message, };
    }
    return { success: true, res: data };
}

export async function deleteRoomTypeAmenity(roomTypeId: number, amenityId: number){
  const {data, error} = await supabase
    .from("RoomTypeAmenities")
    .delete()
    .match({RoomTypeId: roomTypeId, AmenityId: amenityId})

  if (error) {
    return { success: false, res: error.message, };
  }
  return { success: true, res: data };
}

export async function editAmenity(amenityId: number, label: string, description: string){ 
  const { data, error } = await supabase
    .from("Amenities")
    .update({ Label: label, Description: description})
    .eq("Id", amenityId);
  if (error) {
    return { success: false, res: data, error: error.message };
  }
  return { success: true, res: data };
}

interface RoomAvailability {
  TypeName: string;
  AvailableRooms: number;
  Date: string;
}

interface TransformedRoom {
  TypeName: string;
  [key: string]: string | number | null;
}

interface TransformedData {
  data: TransformedRoom[];
  columns: string[];
}