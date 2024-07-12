import React, { useState, useEffect } from "react"

interface FileUploadSummaryProps {
  file: File | null
}

const FileUploadSummary: React.FC<FileUploadSummaryProps> = ({ file }) => {
  const [summary, setSummary] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const handleGenerateSummary = async () => {
      if (!file) return

      setLoading(true)
      const fileName = file.name
      const content = await file.text() // Read file content as text

      const chatSettings = {
        model: "gpt-4o", // Replace with your model
        temperature: 0.7
      }

      try {
        const response = await fetch("/api/chat/summary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            chatSettings,
            content,
            fileName
          })
        })

        if (!response.ok) {
          throw new Error(await response.text())
        }

        const summary = await response.text()
        setSummary(summary)
      } catch (error) {
        console.error("Error generating summary:", error)
        setSummary("Error generating summary. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (file) {
      handleGenerateSummary()
    }
  }, [file])

  return (
    <div className="file-upload-summary">
      {summary && (
        <div className="summary-output">
          <h3>Summary:</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  )
}

export default FileUploadSummary
