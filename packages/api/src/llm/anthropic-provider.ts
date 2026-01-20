import Anthropic from '@anthropic-ai/sdk'
import type { MessageParam, ToolResultBlockParam, Tool } from '@anthropic-ai/sdk/resources/messages'
import type {
  LLMProvider,
  ChatMessage,
  StreamChunk,
  LLMProviderConfig,
  StreamChatOptions,
  ToolResult,
} from './types.js'

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic
  private model: string
  private maxTokens: number

  constructor(config: LLMProviderConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
    })
    this.model = config.model ?? 'claude-sonnet-4-20250514'
    this.maxTokens = config.maxTokens ?? 4096
  }

  async *streamChat(
    messages: ChatMessage[],
    systemPrompt?: string
  ): AsyncGenerator<StreamChunk, void, unknown> {
    try {
      const stream = this.client.messages.stream({
        model: this.model,
        max_tokens: this.maxTokens,
        system: systemPrompt,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      })

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          yield {
            type: 'text_delta',
            content: event.delta.text,
          }
        }
      }

      yield { type: 'done' }
    } catch (error) {
      yield {
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  async *streamChatWithTools(
    options: StreamChatOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const { messages, systemPrompt, tools, toolResults } = options

    try {
      // Build messages array, including tool results if present
      const anthropicMessages: MessageParam[] = this.buildMessages(messages, toolResults)

      // Convert tool definitions to Anthropic format
      const anthropicTools: Tool[] | undefined = tools?.map((tool) => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.input_schema as Tool['input_schema'],
      }))

      const stream = this.client.messages.stream({
        model: this.model,
        max_tokens: this.maxTokens,
        system: systemPrompt,
        messages: anthropicMessages,
        tools: anthropicTools,
      })

      // Track current tool use block for accumulating input
      let currentToolUse: { id: string; name: string; inputJson: string } | null = null

      for await (const event of stream) {
        if (event.type === 'content_block_start') {
          if (event.content_block.type === 'tool_use') {
            currentToolUse = {
              id: event.content_block.id,
              name: event.content_block.name,
              inputJson: '',
            }
          }
        } else if (event.type === 'content_block_delta') {
          if (event.delta.type === 'text_delta') {
            yield {
              type: 'text_delta',
              content: event.delta.text,
            }
          } else if (event.delta.type === 'input_json_delta' && currentToolUse) {
            currentToolUse.inputJson += event.delta.partial_json
          }
        } else if (event.type === 'content_block_stop' && currentToolUse) {
          // Tool use block complete, parse and yield
          try {
            const input = JSON.parse(currentToolUse.inputJson || '{}')
            yield {
              type: 'tool_use',
              toolCall: {
                id: currentToolUse.id,
                name: currentToolUse.name,
                input,
              },
            }
          } catch {
            yield {
              type: 'error',
              error: 'Failed to parse tool input JSON',
            }
          }
          currentToolUse = null
        }
      }

      yield { type: 'done' }
    } catch (error) {
      yield {
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  /**
   * Build Anthropic message array from chat messages and optional tool results
   */
  private buildMessages(
    messages: ChatMessage[],
    toolResults?: ToolResult[]
  ): MessageParam[] {
    const anthropicMessages: MessageParam[] = messages.map((msg) => {
      // Handle both string content and structured content blocks
      if (typeof msg.content === 'string') {
        return {
          role: msg.role,
          content: msg.content,
        }
      }
      
      // Convert our content blocks to Anthropic format
      return {
        role: msg.role,
        content: msg.content.map((block) => {
          if (block.type === 'text') {
            return { type: 'text' as const, text: block.text }
          }
          // tool_use block
          return {
            type: 'tool_use' as const,
            id: block.id,
            name: block.name,
            input: block.input,
          }
        }),
      }
    })

    // If we have tool results, append them as a user message with tool_result blocks
    if (toolResults && toolResults.length > 0) {
      const toolResultBlocks: ToolResultBlockParam[] = toolResults.map((result) => ({
        type: 'tool_result' as const,
        tool_use_id: result.tool_use_id,
        content: result.content,
        is_error: result.is_error,
      }))

      anthropicMessages.push({
        role: 'user',
        content: toolResultBlocks,
      })
    }

    return anthropicMessages
  }
}

