// import { useContext, useEffect, useState } from "react";
// import { toast } from "sonner";
// import { supabase } from "@/lib/supabase/browser-client";
// import { ChatbotUIContext } from "@/context/context";
// import { getFileFromStorage } from "@/db/storage/files";
// import { Tables } from "@/supabase/types";

// interface FileItemProps {
//   file: Tables<"files">
// }

// export const useSelectFileHandler = () => {
//   const {
//     selectedWorkspace,
//     profile,
//     chatSettings,
//     setNewMessageFiles,
//     setShowFilesDisplay,
//   } = useContext(ChatbotUIContext);

//   const [supabaseFiles, setSupabaseFiles] = useState<Tables<"files">[]>([]);

//   useEffect(() => {
//     if (selectedWorkspace && chatSettings) {
//       fetchSupabaseFiles();
//     }
//   }, [selectedWorkspace, chatSettings]);

//   const fetchSupabaseFiles = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('files')
//         .select('id, name, file_path'); // Only selecting relevant fields

//       if (error) {
//         throw error;
//       }

//       if (data) {
//         setSupabaseFiles(data);
//       }
//     } catch (error) {
//       console.error('Error fetching files from Supabase:', error.message);
//       toast.error('Failed to fetch files from Supabase.', { duration: 10000 });
//     }
//   };

//   const handleSelectSupabaseFile = async (file: Tables<"files">) => {
//     if (!profile || !selectedWorkspace || !chatSettings) return;

//     setShowFilesDisplay(true);

//     try {
//       const link = await getFileFromStorage(file.file_path);

//       const newFile = {
//         created_at: "",
//         description: "",
//         file_path: file.file_path,
//         folder_id: null,
//         id: file.id,
//         name: file.name,
//         sharing: "",
//         size: null,
//         summary: null,
//         tokens: null,
//         type: "",
//         updated_at: null,
//         user_id: ""
//       };

//       setNewMessageFiles(prevFiles => [...prevFiles, newFile]);

//       window.open(link, "_blank");
//     } catch (error) {
//       console.error("Error handling Supabase file selection:", error.message);
//       toast.error("Failed to handle Supabase file selection.", { duration: 10000 });
//     }
//   };

//   return {
//     handleSelectSupabaseFile,
//     supabaseFiles
//   };
// };
