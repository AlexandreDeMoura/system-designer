import type { LLMProvider, LLMProviderConfig } from './types.js'
import { AnthropicProvider } from './anthropic-provider.js'

export type {
  LLMProvider,
  LLMProviderConfig,
  ChatMessage,
  StreamChunk,
  ToolDefinition,
  ToolCall,
  ToolResult,
  StreamChatOptions,
} from './types.js'
export { AnthropicProvider } from './anthropic-provider.js'

export type ProviderType = 'anthropic' 

/**
 * Factory function to create LLM providers
 */
export function createLLMProvider(
  provider: ProviderType,
  config: LLMProviderConfig
): LLMProvider {
  switch (provider) {
    case 'anthropic':
      return new AnthropicProvider(config)
    // Future providers can be added here:
    // case 'openai':
    //   return new OpenAIProvider(config)
    default:
      throw new Error(`Unknown LLM provider: ${provider}`)
  }
}

