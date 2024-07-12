import React, { useState } from "react"
import { Tabs, Tab, Box } from "@mui/material"
import FileUploadSummary from "./FileUploadSummary"

const MultiTabFileUpload = () => {
  const [files, setFiles] = useState<(File | null)[]>([])
  const [selectedTab, setSelectedTab] = useState(0)

  const handleFileChange = (index: number, file: File | null) => {
    const newFiles = [...files]
    newFiles[index] = file
    setFiles(newFiles)
  }

  const addNewTab = () => {
    setFiles([...files, null])
    setSelectedTab(files.length)
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs
        value={selectedTab}
        onChange={(e, newValue) => setSelectedTab(newValue)}
        aria-label="file upload tabs"
      >
        {files.map((_, index) => (
          <Tab key={index} label={`File ${index + 1}`} />
        ))}
        <Tab label="+" onClick={addNewTab} />
      </Tabs>
      {files.map((file, index) => (
        <div key={index} hidden={selectedTab !== index}>
          <input
            type="file"
            onChange={e =>
              handleFileChange(index, e.target.files ? e.target.files[0] : null)
            }
          />
          {file && <FileUploadSummary file={file} />}
        </div>
      ))}
    </Box>
  )
}

export default MultiTabFileUpload
