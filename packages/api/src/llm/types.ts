// LLM Provider abstraction for easy switching between providers

// Content block types for structured messages (matching Anthropic's format)
export interface TextContentBlock {
  type: 'text'
  text: string
}

export interface ToolUseContentBlock {
  type: 'tool_use'
  id: string
  name: string
  input: Record<string, unknown>
}

export type ContentBlock = TextContentBlock | ToolUseContentBlock

export interface ChatMessage {
  role: 'user' | 'assistant'
  // Content can be a string (simple text) or an array of content blocks (for tool use)
  content: string | ContentBlock[]
}

// Tool definitions for function calling
export interface ToolParameter {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  description: string
  enum?: string[]
}

export interface ToolDefinition {
  name: string
  description: string
  input_schema: {
    type: 'object'
    properties: Record<string, ToolParameter>
    required: string[]
  }
}

// Tool call from the LLM
export interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
}

// Tool result to send back to the LLM
export interface ToolResult {
  tool_use_id: string
  content: string
  is_error?: boolean
}

// Extended stream chunk types for tool support
export interface StreamChunk {
  type: 'text_delta' | 'tool_use' | 'done' | 'error'
  content?: string
  error?: string
  toolCall?: ToolCall
}

// Options for streaming chat with tools
export interface StreamChatOptions {
  messages: ChatMessage[]
  systemPrompt?: string
  tools?: ToolDefinition[]
  toolResults?: ToolResult[]
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

  /**
   * Stream a chat completion with tool support
   * @param options - Chat options including messages, system prompt, tools, and tool results
   * @returns AsyncGenerator yielding stream chunks (text or tool calls)
   */
  streamChatWithTools?(
    options: StreamChatOptions
  ): AsyncGenerator<StreamChunk, void, unknown>
}

export interface LLMProviderConfig {
  apiKey: string
  model?: string
  maxTokens?: number
}

