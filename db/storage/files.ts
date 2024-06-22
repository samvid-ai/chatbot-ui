import { supabase } from "@/lib/supabase/browser-client"
import { toast } from "sonner"

export const uploadFile = async (
  file: File,
  payload: {
    name: string
    user_id: string
    file_id: string
  }
) => {
  const SIZE_LIMIT = parseInt(
    process.env.NEXT_PUBLIC_USER_FILE_SIZE_LIMIT || "10000000"
  )

  if (file.size > SIZE_LIMIT) {
    throw new Error(
      `File must be less than ${Math.floor(SIZE_LIMIT / 1000000)}MB`
    )
  }

  const filePath = `${payload.user_id}/${Buffer.from(payload.file_id).toString(
    "base64"
  )}`

  const { error } = await supabase.storage
    .from("files")
    .upload(filePath, file, {
      upsert: true
    })

  if (error) {
    throw new Error("Error uploading file")
  }

  return filePath
}

export const deleteFileFromStorage = async (filePath: string) => {
  const { error } = await supabase.storage.from("files").remove([filePath])

  if (error) {
    toast.error("Failed to remove file!")
    return
  }
}

export const getFileFromStorage = async (filePath: string) => {
  const { data, error } = await supabase.storage
    .from("files")
    .createSignedUrl(filePath, 60 * 60 * 24) // 24hrs

  if (error) {
    console.error(`Error uploading file with path: ${filePath}`, error)
    throw new Error("Error downloading file")
  }

  return data.signedUrl
}

export const getFileContentFromStorage = async (filePath: string) => {
  const { data, error } = await supabase.storage
    .from("files")
    .download(filePath)

  if (error) {
    console.error(`Error downloading file with path: ${filePath}`, error)
    throw new Error("Error downloading file")
  }

  // Convert the downloaded data (Blob) to a string (assuming text file content)
  const fileReader = new FileReader()
  return new Promise<string>((resolve, reject) => {
    fileReader.onload = () => {
      const content = fileReader.result as string
      resolve(content)
    }
    fileReader.onerror = error => {
      reject(error)
    }
    fileReader.readAsText(data as Blob)
  })
}
