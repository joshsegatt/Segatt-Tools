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

  static async isWebGPUSupported(): Promise<boolean> {
    if (typeof navigator === "undefined") return false;
    const nav = navigator as any;
    if (!nav.gpu) return false;
    try {
      const adapter = await nav.gpu.requestAdapter();
      return !!adapter;
    } catch {
      return false;
    }
  }

  static async sendMessage(
    engine: AIEngineType, 
    message: string, 
    language: string,
    options?: { model?: string }
  ): Promise<string> {
    // ... logic remains same, calling sub-methods
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
      const isSupported = await this.isWebGPUSupported();
      if (!isSupported) {
        return "Local AI Error: WebGPU is not supported on this hardware or driver version. Please update your graphics drivers or use Ollama/Heuristic mode.";
      }

      if (!this.localEngine || this.currentModelId !== modelId) {
        this.localEngine = await webllm.CreateMLCEngine(modelId, {
          initProgressCallback: (info) => console.log("Initializing AI Engine:", info.text)
        });
        this.currentModelId = modelId;
      }

      const reply = await this.localEngine.chat.completions.create({
        messages: [{ role: "user", content: message }]
      });
      return reply.choices[0].message.content || "Empty response from local AI.";
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes("WebGPU")) {
        return "Local AI Error: WebGPU hardware initialization failed. Try updating your graphics drivers.";
      }
      return `Local AI Error: ${errorMsg}. Make sure you downloaded the model in the Model Hub first!`;
    }
  }
}
