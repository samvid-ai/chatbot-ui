import React, { useState, useEffect, useContext, FC } from "react"
import { useParams } from "next/navigation"
import Loading from "@/app/[locale]/loading"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatbotUIContext } from "@/context/context"
import { getAssistantToolsByAssistantId } from "@/db/assistant-tools"
import { getChatFilesByChatId } from "@/db/chat-files"
import { getChatById } from "@/db/chats"
import { getMessageFileItemsByMessageId } from "@/db/message-file-items"
import { getMessagesByChatId } from "@/db/messages"
import { getMessageImageFromStorage } from "@/db/storage/message-images"
import { convertBlobToBase64 } from "@/lib/blob-to-b64"
import useHotkey from "@/lib/hooks/use-hotkey"
import { LLMID, MessageImage } from "@/types"
import { ChatHelp } from "./chat-help"
import { useScroll } from "./chat-hooks/use-scroll"
import { ChatInput } from "./chat-input"
import { ChatMessages } from "./chat-messages"
import { ChatScrollButtons } from "./chat-scroll-buttons"
import { ChatSecondaryButtons } from "./chat-secondary-buttons"
import FileUploadSummary from "./FileUploadSummary" // Make sure the path is correct

import { Tabs, Tab, Box, IconButton } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"

interface ChatUIProps {}

export const ChatUI: FC<ChatUIProps> = ({}) => {
  useHotkey("o", () => handleNewChat())

  const params = useParams()

  const {
    setChatMessages,
    selectedChat,
    setSelectedChat,
    setChatSettings,
    setChatImages,
    assistants,
    setSelectedAssistant,
    setChatFileItems,
    setChatFiles,
    setShowFilesDisplay,
    setUseRetrieval,
    setSelectedTools,
    showFilesDisplay
  } = useContext(ChatbotUIContext)

  const { handleNewChat, handleFocusChatInput } = useChatHandler()

  const {
    messagesStartRef,
    messagesEndRef,
    handleScroll,
    scrollToBottom,
    setIsAtBottom,
    isAtTop,
    isAtBottom,
    isOverflowing,
    scrollToTop
  } = useScroll()

  const [loading, setLoading] = useState(true)
  const [files, setFiles] = useState<(File | null)[]>([])
  const [selectedTab, setSelectedTab] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      await fetchMessages()
      await fetchChat()

      scrollToBottom()
      setIsAtBottom(true)
    }

    if (params.chatid) {
      fetchData().then(() => {
        handleFocusChatInput()
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  const fetchMessages = async () => {
    const fetchedMessages = await getMessagesByChatId(params.chatid as string)

    const imagePromises: Promise<MessageImage>[] = fetchedMessages.flatMap(
      message =>
        message.image_paths
          ? message.image_paths.map(async imagePath => {
              const url = await getMessageImageFromStorage(imagePath)

              if (url) {
                const response = await fetch(url)
                const blob = await response.blob()
                const base64 = await convertBlobToBase64(blob)

                return {
                  messageId: message.id,
                  path: imagePath,
                  base64,
                  url,
                  file: null
                }
              }

              return {
                messageId: message.id,
                path: imagePath,
                base64: "",
                url,
                file: null
              }
            })
          : []
    )

    const images: MessageImage[] = await Promise.all(imagePromises.flat())
    setChatImages(images)

    const messageFileItemPromises = fetchedMessages.map(
      async message => await getMessageFileItemsByMessageId(message.id)
    )

    const messageFileItems = await Promise.all(messageFileItemPromises)

    const uniqueFileItems = messageFileItems.flatMap(item => item.file_items)
    setChatFileItems(uniqueFileItems)

    const chatFiles = await getChatFilesByChatId(params.chatid as string)

    setChatFiles(
      chatFiles.files.map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        file: null
      }))
    )

    setUseRetrieval(true)
    setShowFilesDisplay(true)

    const fetchedChatMessages = fetchedMessages.map(message => {
      return {
        message,
        fileItems: messageFileItems
          .filter(messageFileItem => messageFileItem.id === message.id)
          .flatMap(messageFileItem =>
            messageFileItem.file_items.map(fileItem => fileItem.id)
          )
      }
    })

    setChatMessages(fetchedChatMessages)
  }

  const fetchChat = async () => {
    const chat = await getChatById(params.chatid as string)
    if (!chat) return

    if (chat.assistant_id) {
      const assistant = assistants.find(
        assistant => assistant.id === chat.assistant_id
      )

      if (assistant) {
        setSelectedAssistant(assistant)

        const assistantTools = (
          await getAssistantToolsByAssistantId(assistant.id)
        ).tools
        setSelectedTools(assistantTools)
      }
    }

    setSelectedChat(chat)
    setChatSettings({
      model: chat.model as LLMID,
      prompt: chat.prompt,
      temperature: chat.temperature,
      contextLength: chat.context_length,
      includeProfileContext: chat.include_profile_context,
      includeWorkspaceInstructions: chat.include_workspace_instructions,
      embeddingsProvider: chat.embeddings_provider as "openai" | "local"
    })
  }

  const handleFileChange = (index: number, file: File | null) => {
    const newFiles = [...files]
    newFiles[index] = file
    setFiles(newFiles)
  }

  const addNewTab = () => {
    setFiles([...files, null])
    setSelectedTab(files.length)
  }

  // const handleCloseTab = (index: number) => {
  //   const newFiles = [...files]
  //   newFiles.splice(index, 1)
  //   setFiles(newFiles)
  //   setSelectedTab(Math.min(index, newFiles.length - 1))
  // }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="relative flex h-full flex-col items-center overflow-hidden">
      <div className="absolute left-4 top-2.5 flex justify-center">
        <ChatScrollButtons
          isAtTop={isAtTop}
          isAtBottom={isAtBottom}
          isOverflowing={isOverflowing}
          scrollToTop={scrollToTop}
          scrollToBottom={scrollToBottom}
        />
      </div>

      <div className="absolute right-4 top-1 flex h-[40px] items-center space-x-2">
        <ChatSecondaryButtons />
      </div>

      <div className="bg-secondary flex max-h-[50px] min-h-[50px] w-full items-center justify-center border-b-2 font-bold">
        <div className="max-w-[200px] truncate sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px]">
          {selectedChat?.name || "Chat"}
        </div>
      </div>

      <div className="flex w-full grow flex-col overflow-hidden">
        {/* Wrap the FileUploadSummary component to constrain its width */}
        <div className="w-full min-w-[300px] px-2 pb-3 sm:w-[600px] md:w-[700px] lg:w-[700px] xl:w-[800px]">
          <Box sx={{ width: "100%" }}>
            <Tabs
              value={selectedTab}
              onChange={(e, newValue) => setSelectedTab(newValue)}
              aria-label="file upload tabs"
              sx={{
                "& .MuiTabs-indicator": { backgroundColor: "blue" }, // Indicator color
                "& .MuiTab-root": { color: "gray" }, // Unselected tab color
                "& .Mui-selected": { color: "blue" } // Selected tab color
              }}
            >
              {files.map((_, index) => (
                <Tab
                  key={index}
                  label={`File ${index + 1}`}
                  // Close button for each tab
                  // icon={
                  //   <IconButton
                  //     size="small"
                  //     onClick={() => handleCloseTab(index)}
                  //   >
                  //     <CloseIcon />
                  //   </IconButton>
                  // }
                />
              ))}
              <Tab label="+" onClick={addNewTab} />
            </Tabs>
            {files.map((file, index) => (
              <div key={index} hidden={selectedTab !== index}>
                <input
                  type="file"
                  onChange={e =>
                    handleFileChange(
                      index,
                      e.target.files ? e.target.files[0] : null
                    )
                  }
                />
                {file && <FileUploadSummary file={file} />}
              </div>
            ))}
          </Box>
        </div>

        <div
          // className={`flex flex-col ${showFilesDisplay ? "h-1/2" : "grow"} w-full overflow-auto`}
          className="flex size-full flex-col overflow-auto border-b"
          onScroll={handleScroll}
        >
          <div ref={messagesStartRef} />
          <ChatMessages />
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="absolute bottom-0 w-full min-w-[300px] px-2 pb-3 pt-0 sm:w-[600px] sm:pb-8 sm:pt-5 md:w-[700px] lg:w-[700px] xl:w-[800px]">
        <ChatInput onFileChange={file => handleFileChange(selectedTab, file)} />{" "}
        {/* Add the onFileChange prop */}
      </div>

      <div className="absolute bottom-2 right-2 hidden md:block lg:bottom-4 lg:right-4">
        <ChatHelp />
      </div>
    </div>
  )
}

export default ChatUI
