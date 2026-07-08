"use server";

import { createServerSideClient, createAdminServiceSideClient } from "@/utils/supabase";
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

export async function updateUserAdminAction(
  userId: string,
  data: {
    email: string;
    role: string;
    fullName: string;
    phoneNumber: string;
    locationName: string;
    password?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSideClient();

    // 1. Get current logged-in user
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return { success: false, error: "Unauthorized" };

    // Verify admin role
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single();

    if (!adminProfile || adminProfile.role !== "admin") {
      return { success: false, error: "Forbidden" };
    }

    // 2. Initialize admin client with service role key
    const adminSupabase = await createAdminServiceSideClient();

    // 3. Update auth user details (email and optionally password and metadata)
    const updateParams: any = {
      email: data.email,
      user_metadata: {
        role: data.role,
        full_name: data.fullName,
        phone_number: data.phoneNumber,
        location_name: data.locationName,
      }
    };

    if (data.password && data.password.trim() !== "") {
      updateParams.password = data.password;
    }

    const { error: authError } = await adminSupabase.auth.admin.updateUserById(userId, updateParams);
    if (authError) {
      return { success: false, error: `Auth Update Failed: ${authError.message}` };
    }

    // 4. Directly update profiles table (in case trigger didn't run or we want to ensure sync)
    const { error: profileError } = await adminSupabase
      .from("profiles")
      .update({
        email: data.email,
        role: data.role,
        full_name: data.fullName,
        phone_number: data.phoneNumber,
        location_name: data.locationName,
      })
      .eq("id", userId);

    if (profileError) {
      return { success: false, error: `Profile Update Failed: ${profileError.message}` };
    }

    // 5. Log administrative action
    await adminSupabase.from("admin_logs").insert({
      admin_id: currentUser.id,
      action: "UPDATE_USER",
      target_type: "profiles",
      target_id: userId,
      details: {
        updated_fields: {
          email: data.email,
          role: data.role,
          full_name: data.fullName,
          phone_number: data.phoneNumber,
          location_name: data.locationName,
          password_updated: !!(data.password && data.password.trim() !== ""),
        }
      },
    });

    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

export async function deleteUserAdminAction(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSideClient();

    // 1. Get current logged-in user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // Verify admin role
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!adminProfile || adminProfile.role !== "admin") {
      return { success: false, error: "Forbidden" };
    }

    // 2. Initialize service role client
    const adminSupabase = await createAdminServiceSideClient();

    // 3. Delete user from auth schema first
    const { error: authError } = await adminSupabase.auth.admin.deleteUser(userId);
    if (authError) {
      const isUserNotFound = 
        (authError as any).status === 404 || 
        (authError as any).code === 'user_not_found' || 
        authError.message.toLowerCase().includes('not found');
        
      if (!isUserNotFound) {
        return { success: false, error: `Auth deletion failed: ${authError.message}` };
      }
    }

    // 4. Delete user profile from database public schema (which cascades to child profiles)
    const { error: profileError } = await adminSupabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      return { success: false, error: `Profile deletion failed: ${profileError.message}` };
    }

    // 5. Log audit trail
    await adminSupabase.from("admin_logs").insert({
      admin_id: user.id,
      action: "DELETE_USER",
      target_type: "profiles",
      target_id: userId,
      details: { reason: "Administrator direct account deletion" },
    });

    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

export async function createUserAdminAction(
  data: {
    email: string;
    role: string;
    fullName: string;
    phoneNumber: string;
    locationName: string;
    password?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSideClient();

    // 1. Get current logged-in user
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return { success: false, error: "Unauthorized" };

    // Verify admin role
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single();

    if (!adminProfile || adminProfile.role !== "admin") {
      return { success: false, error: "Forbidden" };
    }

    // 2. Initialize admin client with service role key
    const adminSupabase = await createAdminServiceSideClient();

    // 3. Create user using Admin API (which auto-confirms email)
    const { data: createdUser, error: authError } = await adminSupabase.auth.admin.createUser({
      email: data.email,
      password: data.password || "Password1234",
      email_confirm: true,
      user_metadata: {
        role: data.role,
        full_name: data.fullName,
        phone_number: data.phoneNumber,
        location_name: data.locationName,
      }
    });

    if (authError || !createdUser || !createdUser.user) {
      return { success: false, error: `Auth Creation Failed: ${authError?.message || "Unknown error"}` };
    }

    const newUserId = createdUser.user.id;

    // 4. Check if profile was automatically created by DB trigger. If not, insert it manually.
    const { data: existingProfile } = await adminSupabase
      .from("profiles")
      .select("id")
      .eq("id", newUserId)
      .maybeSingle();

    if (!existingProfile) {
      const { error: profileError } = await adminSupabase
        .from("profiles")
        .insert({
          id: newUserId,
          email: data.email,
          role: data.role,
          full_name: data.fullName,
          phone_number: data.phoneNumber,
          location_name: data.locationName,
        });

      if (profileError) {
        return { success: false, error: `Profile Creation Failed: ${profileError.message}` };
      }

      // Insert default child profile mappings based on user role
      if (data.role === 'farmer') {
        await adminSupabase.from("farmer_profiles").insert({ id: newUserId, farm_name: "Ghana Fresh Farm" });
      } else if (data.role === 'buyer') {
        await adminSupabase.from("buyer_profiles").insert({ id: newUserId, business_name: "Independent Retailer" });
      } else if (data.role === 'transporter') {
        await adminSupabase.from("transport_profiles").insert({ id: newUserId, vehicle_type: "Tricycle/Aboboyaa" });
      }
    }

    // 5. Log administrative action
    await adminSupabase.from("admin_logs").insert({
      admin_id: currentUser.id,
      action: "CREATE_USER",
      target_type: "profiles",
      target_id: newUserId,
      details: {
        email: data.email,
        role: data.role,
        full_name: data.fullName,
      },
    });

    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}
