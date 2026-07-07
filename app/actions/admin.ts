"use server";

import { createServerSideClient } from "@/utils/supabase";
import { revalidatePath } from "next/cache";

export async function deleteProduceAdminAction(id: string, formData?: FormData): Promise<void> {
  try {
    const supabase = await createServerSideClient();

    // 1. Get current logged-in user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Verify admin role
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!adminProfile || adminProfile.role !== "admin") return;

    // 2. Perform delete
    const { error: deleteErr } = await supabase
      .from("produce")
      .delete()
      .eq("id", id);

    if (deleteErr) return;

    // 3. Log administrative audit action
    await supabase.from("admin_logs").insert({
      admin_id: user.id,
      action: "DELETE_LISTING",
      target_type: "produce",
      target_id: id,
      details: { reason: "Moderator deletion of listing" },
    });

    revalidatePath("/dashboard/admin");
  } catch (error) {
    // Fail silently
  }
}

export async function suspendUserAdminAction(userId: string, formData?: FormData): Promise<void> {
  try {
    const supabase = await createServerSideClient();

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Verify admin role
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!adminProfile || adminProfile.role !== "admin") return;

    // 2. Log suspension in audits ledger
    await supabase.from("admin_logs").insert({
      admin_id: user.id,
      action: "SUSPEND_USER",
      target_type: "profiles",
      target_id: userId,
      details: { reason: "Policy violation suspension trigger" },
    });

    revalidatePath("/dashboard/admin");
  } catch (error) {
    // Fail silently
  }
}
