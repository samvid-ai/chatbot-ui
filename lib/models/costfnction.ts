// utils/costCalculator.ts
import { LLMID, LLM } from "@/types"

export function calculateCost(
  modelId: LLMID,
  inputTokens: number,
  outputTokens: number,
  llmList: LLM[]
): number {
  const model = llmList.find(m => m.modelId === modelId)

  if (!model || !model.pricing) {
    throw new Error("Model not found or pricing information is missing")
  }

  const inputCost = model.pricing.inputCost || 0
  const outputCost = model.pricing.outputCost || 0

  const cost =
    (inputTokens / 1e6) * inputCost + (outputTokens / 1e6) * outputCost
  return cost
}
