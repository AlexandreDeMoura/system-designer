import Anthropic from '@anthropic-ai/sdk'
import type { LLMProvider, ChatMessage, StreamChunk, LLMProviderConfig } from './types.js'

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
}

