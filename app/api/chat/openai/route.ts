import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings, LLMID } from "@/types"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { ServerRuntime } from "next"
import OpenAI from "openai"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs"
import { calculateCost } from "@/lib/models/costfnction"
import tokenizer from "gpt-tokenizer"
import { OPENAI_LLM_LIST } from "@/lib/models/llm/openai-llm-list" // Assuming you saved the models in this file

export const runtime: ServerRuntime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  try {
    const profile = await getServerProfile()

    checkApiKey(profile.openai_api_key, "OpenAI")

    const openai = new OpenAI({
      apiKey: profile.openai_api_key || "",
      organization: profile.openai_organization_id
    })

    // Tokenize the last input message
    const lastMessage = messages[messages.length - 1]
    const inputTokens = tokenizer.encode(lastMessage.content).length
    const maxTokens =
      chatSettings.model === "gpt-4-vision-preview" ||
      chatSettings.model === "gpt-4o"
        ? 4096
        : null

    const response = await openai.chat.completions.create({
      model: chatSettings.model as ChatCompletionCreateParamsBase["model"],
      messages: messages as ChatCompletionCreateParamsBase["messages"],
      temperature: chatSettings.temperature,
      max_tokens: maxTokens,
      stream: true
    })

    // Process the response stream to count the output tokens
    let outputTokens = 0
    const stream = OpenAIStream(response, {
      async onToken(token) {
        outputTokens += tokenizer.encode(token).length
        console.log(`output tokens in here: ${outputTokens}`)
      }
    })

    const cost = calculateCost(
      chatSettings.model as LLMID,
      inputTokens,
      outputTokens,
      OPENAI_LLM_LIST
    )
    console.log(`output tokens: ${outputTokens}`)
    console.log(`input tokens: ${inputTokens}`)
    console.log(`Cost for the request: ${cost}`)

    return new StreamingTextResponse(stream, {
      headers: {
        "X-Cost": cost.toString()
      }
    })
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "OpenAI API Key not found. Please set it in your profile settings."
    } else if (errorMessage.toLowerCase().includes("incorrect api key")) {
      errorMessage =
        "OpenAI API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
