// LLM Provider abstraction for easy switching between providers

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface StreamChunk {
  type: 'text_delta' | 'done' | 'error'
  content?: string
  error?: string
}

export interface LLMProvider {
  /**
   * Stream a chat completion response
   * @param messages - The conversation history
   * @param systemPrompt - Optional system prompt
   * @returns AsyncGenerator yielding stream chunks
   */
  streamChat(
    messages: ChatMessage[],
    systemPrompt?: string
  ): AsyncGenerator<StreamChunk, void, unknown>
}

export interface LLMProviderConfig {
  apiKey: string
  model?: string
  maxTokens?: number
}

