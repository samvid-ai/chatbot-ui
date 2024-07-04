import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { ServerRuntime } from "next"
import OpenAI from "openai"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs"

export const runtime: ServerRuntime = "edge"

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const { chatSettings, content, fileName } = json as {
      chatSettings: ChatSettings
      content: string
      fileName: string
    }

    const profile = await getServerProfile()

    checkApiKey(profile.openai_api_key, "OpenAI")

    const openai = new OpenAI({
      apiKey: profile.openai_api_key || "",
      organization: profile.openai_organization_id
    })

    // Prepare the prompt for summarization
    const prompt = `Please provide a summary for the following text from the file ${fileName}:\n\n${content}`

    const response = await openai.chat.completions.create({
      model: chatSettings.model as ChatCompletionCreateParamsBase["model"],
      messages: [{ role: "user", content: prompt }],
      temperature: chatSettings.temperature,
      max_tokens: 200, // You may adjust this value if necessary
      stream: false // Ensure the response is not streamed
    })

    const summary = response.choices[0].message.content

    console.log("Summary:", summary) // Log the summary

    // Return the summary as plain text
    return new Response(summary, {
      status: 200,
      headers: { "Content-Type": "text/plain" }
    })
  } catch (error: any) {
    console.error("Error in /api/chat/summary:", error.stack || error.message) // Log the entire error message or stack trace
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "OpenAI API Key not found. Please set it in your profile settings."
    } else if (errorMessage.toLowerCase().includes("incorrect api key")) {
      errorMessage =
        "OpenAI API Key is incorrect. Please fix it in your profile settings."
    }

    console.log("Error Message:", errorMessage) // Log the error message

    // Return the error message as plain text
    return new Response(errorMessage, {
      status: errorCode,
      headers: { "Content-Type": "text/plain" }
    })
  }
}
