import { supabase } from "@/lib/supabase/browser-client" // adjust the import according to your project structure

export const fetchFilesFromSupabase = async () => {
  const { data, error } = await supabase
    .from("files")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}
