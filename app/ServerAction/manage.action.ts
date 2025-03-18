"use server";
import { createClient } from "@/utils/supabase/server";
import { Contact } from "lucide-react";

interface EditGuestProps {
    id: string,
    email?: string,
    contact?: number,
    birthdate?: Date,
    nationality?: string,
    firstname?: string,
    lastname?: string,
}


const supabase = createClient();

export async function getGuests() {
    const { data, error } = await supabase
        .from("GuestData")
        .select("*")
        .eq("isDeleted", false);

    if (error) {
        console.log(error);
        return { success: false, res: data };
    }
    return { success: true, res: data };
}
export async function getGuestDetails(Id: string) {
    const { data, error } = await supabase
      .from("GuestData")
      .select("*")
      .eq("Id", Id)
      .single();
  
    const { data: data2, error: error2 } = await supabase
      .from("Reservations")
      .select("*, ...RoomTypes(RoomType:TypeName)")
      .eq("GuestId", Id);
  
    const { data: data3, error: error3 } = await supabase
      .from("assigned_rooms")
      .select("RoomNumber, ReservationId") // Make sure to select the ReservationId
      .eq("GuestId", Id);
  
    if (error || error2 || error3) {
      return { success: false, res: [data, data2, data3] };
    }
  
    // Return all three pieces of data: GuestData, Reservations (with RoomTypes), and assigned_rooms.
    return { success: true, res: [data, data2, data3] };
  }

export async function editGuest(values: EditGuestProps) {

    const { data, error } = await supabase
    .from("GuestData")
    .update({
        Email: values.email,
        Contact: values.contact,
        FirstName: values.firstname,
        LastName: values.lastname
    })
    .eq("Id", values.id)

    console.log(values)

    if (error) {
    // console.log(error);
        return { success: false, res: data, error: error.message };
    }
    // console.log(data);
        return { success: true, res: data };
}

export async function editGuestId(values: any, id: string) {
    console.log(id, values)
    const { data, error } = await supabase
        .from("GuestData")
        .update({FirstName: values.firstName, LastName: values.lastName, Email: values.email, Contact: values.contact})
        .eq("Id", id)

    if (error) {
        console.log(error);
        return { success: false, res: data, error: error.message };
    }
        console.log(data);
        return { success: true, res: data };
}

export async function deleteGuest(id: string) {
    const { data, error } = await supabase
        .from("GuestData")
        .update({ isDeleted: 1 })
        .eq("Id", id);
    if (error) {
        return { success: false, error: error.message };
    }
        return { success: true, data: data };
}
/* export async function editGuest(){
    const { data, error } = await supabase
} */
export async function getUsers() {
    const { data, error } = await supabase
        .from("UserProfile")
        .select("*, ...UserRole(Role:name)");
    if (error) {
        console.log(error);
        return { success: false, res: data };
    }
    return { success: true, res: data };
}
export async function addUser(value: any) {
    console.log(value);
    const { email, password, firstName, lastName, roleId } = value;

    console.log(email, password, firstName, lastName, roleId);

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                firstName: firstName,
                lastName: lastName,
                roleId: roleId
            }
        }
    })

    if (error) {
        console.log(error);
        throw new Error();
    }
    return { success: true, res: data };

}
export async function resetUserPW(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
        console.log(error);
        throw new Error();
    }
    return { success: true, res: data };
}
export async function deleteUser(Id: string) {
    const { data, error } = await supabase
        .from("UserProfile")
        .delete()
        .eq("Id", Id);
    if (error) {
        console.log(error);
        throw new Error();
    }
    return { success: true, res: data };
}
