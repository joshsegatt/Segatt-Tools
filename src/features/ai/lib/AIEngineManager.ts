import { invoke } from "@tauri-apps/api/core";
import * as webllm from "@mlc-ai/web-llm";

export type AIEngineType = "heuristic" | "ollama" | "local";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export class AIEngineManager {
  private static localEngine: webllm.MLCEngine | null = null;
  private static currentModelId: string | null = null;

  static async sendMessage(
    engine: AIEngineType, 
    message: string, 
    language: string,
    options?: { model?: string }
  ): Promise<string> {
    switch (engine) {
      case "ollama":
        return this.sendToOllama(message, options?.model || "llama3");
      case "local":
        return this.sendToLocal(message, options?.model || "Qwen2.5-0.5B-Instruct-q4f16_1-ML");
      case "heuristic":
      default:
        return await invoke("chat_with_segatt_ai", { message, language });
    }
  }

  private static async sendToOllama(message: string, model: string): Promise<string> {
    try {
      const response = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: message }],
          stream: false
        })
      });

      if (!response.ok) throw new Error("Ollama connection failed");
      const data = await response.json();
      return data.message.content;
    } catch (err) {
      return `Error connecting to Ollama: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  private static async sendToLocal(message: string, modelId: string): Promise<string> {
    try {
      if (!this.localEngine || this.currentModelId !== modelId) {
        this.localEngine = await webllm.CreateMLCEngine(modelId);
        this.currentModelId = modelId;
      }

      const reply = await this.localEngine.chat.completions.create({
        messages: [{ role: "user", content: message }]
      });
      return reply.choices[0].message.content || "Empty response from local AI.";
    } catch (err) {
      return `Local AI Error: ${err instanceof Error ? err.message : String(err)}. Make sure you downloaded the model first!`;
    }
  }
}
