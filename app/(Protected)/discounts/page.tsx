import { DiscountsController } from "./DiscountsController";
import { DiscountsModal } from "./DiscountsModal";
import { DiscountsTable } from "./DiscountsTable";
import { createClient } from "@/utils/supabase/server";

export default async function Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("UserProfile")
    .select()
    .eq("UserId", user?.id);

  // Set a default role or handle error cases as needed
  const role = data && data.length > 0 ? data[0].RoleId : 1;
  return (
    <div className="">
      <DiscountsModal />
      <DiscountsController role={role} />
      <DiscountsTable role={role} />
    </div>
  );
}
