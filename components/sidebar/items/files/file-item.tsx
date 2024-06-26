import { FileIcon } from "@/components/ui/file-icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FILE_DESCRIPTION_MAX, FILE_NAME_MAX } from "@/db/limits"
import {
  getFileFromStorage,
  getFileContentFromStorage
} from "@/db/storage/files"
import { Tables } from "@/supabase/types"
import { FC, useState } from "react"
import { SidebarItem } from "../all/sidebar-display-item"

interface FileItemProps {
  file: Tables<"files">
}

export const FileItem: FC<FileItemProps> = ({ file }) => {
  const [name, setName] = useState(file.name)
  const [isTyping, setIsTyping] = useState(false)
  const [description, setDescription] = useState(file.description)
  const [summary, setSummary] = useState(file.summary) // State to hold the summary
  //just put useState(file.summary)
  const [error, setError] = useState<string | null>(null) // State to hold the error message

  const getLinkAndView = async () => {
    const link = await getFileFromStorage(file.file_path)
    window.open(link, "_blank")
  }

  const generateSummary = async () => {
    try {
      const content = await getFileContentFromStorage(file.file_path) // Fetch file content as string

      const summarizeResponse = await fetch("/api/chat/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chatSettings: {
            model: "gpt-4o", // specify the updated model
            temperature: 0.0 // specify the temperature
          },
          content,
          fileName: file.name
        })
      })

      if (!summarizeResponse.ok) {
        throw new Error("Failed to summarize file content")
      }

      const contentType = summarizeResponse.headers.get("Content-Type")

      let result2
      if (contentType && contentType.includes("application/json")) {
        result2 = await summarizeResponse.json()
      } else if (contentType && contentType.includes("text/plain")) {
        const textResponse = await summarizeResponse.text()
        result2 = { summary: textResponse } // Assuming plain text response is the summary
      } else {
        throw new Error("Unsupported response type")
      }

      setSummary(result2.summary)
    } catch (error) {
      console.error("Error fetching or summarizing file content:", error)
      setSummary("Failed to generate summary.") // Handle error scenario
    }
  }

  return (
    <SidebarItem
      item={file}
      isTyping={isTyping}
      contentType="files"
      icon={<FileIcon type={file.type} size={30} />}
      updateState={{ name, description, summary }}
      renderInputs={() => (
        <>
          <div
            className="cursor-pointer underline hover:opacity-50"
            onClick={getLinkAndView}
          >
            View {file.name}
          </div>

          <div className="flex flex-col justify-between">
            <div>{file.type}</div>
            <div>{formatFileSize(file.size)}</div>
            <div>{file.tokens.toLocaleString()} tokens</div>
          </div>

          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              placeholder="File name..."
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={FILE_NAME_MAX}
            />
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <Input
              placeholder="File description..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={FILE_DESCRIPTION_MAX}
            />
          </div>

          {/* Button to generate summary */}
          <button
            className="mt-2 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
            onClick={generateSummary}
          >
            Generate Summary
          </button>

          {/* Display error message if present */}
          {error && (
            <div className="mt-4 rounded border border-red-500 p-2">
              <h3 className="text-lg font-semibold text-red-500">Error:</h3>
              <pre className="whitespace-pre-wrap">{error}</pre>
            </div>
          )}

          {/* Display summary if available */}
          {summary && (
            <div className="mt-4 rounded border border-gray-300 p-2">
              <h3 className="text-lg font-semibold">File Summary:</h3>
              <pre className="whitespace-pre-wrap">{summary}</pre>
            </div>
          )}
        </>
      )}
    />
  )
}

export const formatFileSize = (sizeInBytes: number): string => {
  let size = sizeInBytes
  let unit = "bytes"

  if (size >= 1024) {
    size /= 1024
    unit = "KB"
  }

  if (size >= 1024) {
    size /= 1024
    unit = "MB"
  }

  if (size >= 1024) {
    size /= 1024
    unit = "GB"
  }

  return `${size.toFixed(2)} ${unit}`
}
