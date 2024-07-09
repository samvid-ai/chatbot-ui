import { supabase } from "@/lib/supabase/browser-client"
import { TablesInsert, TablesUpdate } from "@/supabase/types"

export const getProfileByUserId = async (userId: string) => {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (!profile) {
    throw new Error(error.message)
  }

  return profile
}

export const getProfilesByUserId = async (userId: string) => {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)

  if (!profiles) {
    throw new Error(error.message)
  }

  return profiles
}

export const createProfile = async (profile: TablesInsert<"profiles">) => {
  const { data: createdProfile, error } = await supabase
    .from("profiles")
    .insert([profile])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return createdProfile
}

export const createProfiles = async (
  profiles: TablesInsert<"profiles">[],
  workspace_id: string
) => {
  const { data: createdProfiles, error } = await supabase
    .from("profiles")
    .insert(profiles)
    .select("*")

  if (error) {
    throw new Error(error.message)
  }

  await createprofileWorkspaces(
    createdProfiles.map(profile => ({
      user_id: profile.user_id,
      profile_id: profile.id,
      workspace_id
    }))
  )

  return createdProfiles
}

export const createprofileWorkspaces = async (
  items: { user_id: string; profile_id: string; workspace_id: string }[]
) => {
  const { data: createdToolWorkspaces, error } = await supabase
    .from("profile_workspaces")
    .insert(items)
    .select("*")

  if (error) throw new Error(error.message)

  return createprofileWorkspaces
}

export const updateProfile = async (
  profileId: string,
  profile: TablesUpdate<"profiles">
) => {
  const { data: updatedProfile, error } = await supabase
    .from("profiles")
    .update(profile)
    .eq("id", profileId)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return updatedProfile
}

export const deleteProfile = async (profileId: string) => {
  const { error } = await supabase.from("profiles").delete().eq("id", profileId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}

export const deleteprofileWorkspace = async (
  profileId: string,
  workspaceId: string
) => {
  const { error } = await supabase
    .from("profile_workspaces")
    .delete()
    .eq("profile_id", profileId)
    .eq("workspace_id", workspaceId)

  if (error) throw new Error(error.message)

  return true
}

export const getprofileWorkspacesByprofileId = async (userId: string) => {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      `
      user_id, 
      name, 
      workspaces (*)
    `
    )
    .eq("user_id", userId)
    .single()

  if (!profile) {
    throw new Error(error.message)
  }

  return profile
}
