"use server";
import { createClient } from "@/utils/supabase/server";
const supabase = createClient();

export async function getPromos() {
    const { data, error } = await supabase
        .from("Promos")
        .select("*, ...RoomRates(*,...RoomTypes(RoomType:TypeName))").neq("isDeleted", true);
    if (error) {
        throw new Error(error.message);
    }
    return { success: true, res: data };
}

export async function addPromos(data: any) {
    console.log(data);
    const { error } = await supabase.rpc("add_promo", {
        roomtypeid: data.RoomTypeId,
        baseroomrate: data.BaseRoomRate,
        extraadultrate: data.ExtraAdultRate,
        extrachildrate: data.ExtraChildRate,
        statusid: 1,
        promocode: data.PromoCode,
        promoname: data.PromoName,
        redemptioncount: data.RedemptionCount,
        expiredat: data.ExpiredAt
    })
    if (error) {
        console.log(error.message)
        return { success: false, res: error.message };
    }
    return { success: true, res: data };
}

export async function updatePromos(data: any) {
    console.log(data);
    const { error } = await supabase.rpc("update_promo", {
        roomtypeid: data.RoomTypeId,
        roomrateid: data.roomrateid,
        baseroomrate: data.BaseRoomRate,
        extraadultrate: data.ExtraAdultRate,
        extrachildrate: data.ExtraChildRate,
        promocode: data.PromoCode,
        promoname: data.PromoName,
        redemptioncount: data.RedemptionCount,
        expiredat: data.ExpiredAt
    })
    if (error) {
        console.log(error)
        return { success: false, res: error.message }
    }
    return { success: true, res: data };
}

export async function deletePromo(id: string) {
    const { error } = await supabase
        .from("Promos")
        .update({ isDeleted: 1 })
        .eq("PromoDetailId", id);
    if (error) {
        return { success: false };
    }
    return { success: true };
}

export async function checkPromoWalkIn(promoCode: string) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
        .from("Promos")
        .select("Id, PromoCode, PromoName, RedemptionLeft, ExpiredAt, ...RoomRates(RoomRateId:Id, RoomTypeId,...RoomTypes(RoomType:TypeName), BaseRoomRate, ExtraChildRate, ExtraAdultRate, WeekendRoomRate, WeekendExtraChildRate, WeekendExtraAdultRate)")
        .eq("PromoCode", promoCode)
        .neq("isDeleted", true)
        .single();
        console.log(data)
    if (error || !data) {
        return { success: false, message: "Inactive or invalid promo code.", res: null };
    }

    if(data && data.RedemptionLeft <= 0){
        return { success: false, message: "Promo code has been fully redeemed.", res: null };
    }

    if (data.ExpiredAt < today) {
        return { success: false, message: "Promo code has expired.", res: null };
    }
    return { success: true, message: "Promo code is valid.", res: data };
}

/* Public endpoint */
export async function getPromo(promoCode: string) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
        .from("Promos")
        .select("*, ...RoomRates(RoomTypeIds,...RoomTypes(RoomType:TypeName))")
        .eq("PromoCode", promoCode)
        .gte("ExpiredAt", today).single();
    if (error || !data) {
        return { success: false, res: data };
    }
    console.log(data)
    return { success: true, res: data };
}

export async function togglePromoStatus(promoId: number, newStatus: boolean) {
    const { data: promoEdit, error } = await supabase
        .from("Promos")
        .update({
            IsActive: newStatus
        })
        .eq("PromoDetailId", promoId)
        .select()
        .single();

    if (error) {
        console.error("Error updating promo status:", error);
        throw new Error(error.message);
    }

    return { success: true, res: promoEdit };
}





