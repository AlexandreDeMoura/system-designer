import { useState, useMemo, useCallback, memo } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Check, Copy, ChevronDown, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

interface MarkdownRendererProps {
  content: string
  isStreaming?: boolean
}

const CodeBlock = memo(function CodeBlock({ 
  className, 
  children, 
  isStreaming,
  ...props 
}: { 
  className?: string
  children: React.ReactNode
  isStreaming?: boolean
  node?: unknown
}) {
  const [copied, setCopied] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const match = /language-(\w+)/.exec(className || '')
  const language = match ? match[1] : 'text'
  const code = String(children).replace(/\n$/, '')
  
  const lineCount = code.split('\n').length
  const isLongCode = lineCount > 15
  
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])
  
  // Determine display language name
  const languageDisplay = useMemo(() => {
    const langMap: Record<string, string> = {
      js: 'JavaScript',
      javascript: 'JavaScript',
      ts: 'TypeScript',
      typescript: 'TypeScript',
      tsx: 'TypeScript (React)',
      jsx: 'JavaScript (React)',
      py: 'Python',
      python: 'Python',
      rb: 'Ruby',
      ruby: 'Ruby',
      go: 'Go',
      rust: 'Rust',
      rs: 'Rust',
      java: 'Java',
      cpp: 'C++',
      c: 'C',
      cs: 'C#',
      csharp: 'C#',
      php: 'PHP',
      swift: 'Swift',
      kotlin: 'Kotlin',
      sql: 'SQL',
      bash: 'Bash',
      sh: 'Shell',
      shell: 'Shell',
      zsh: 'Zsh',
      yaml: 'YAML',
      yml: 'YAML',
      json: 'JSON',
      xml: 'XML',
      html: 'HTML',
      css: 'CSS',
      scss: 'SCSS',
      sass: 'Sass',
      markdown: 'Markdown',
      md: 'Markdown',
      docker: 'Dockerfile',
      dockerfile: 'Dockerfile',
      text: 'Plain Text',
    }
    return langMap[language.toLowerCase()] || language.toUpperCase()
  }, [language])

  return (
    <div className="code-block-wrapper group relative my-4 rounded-xl overflow-hidden border border-[#1e2d44] bg-[#0a0e17]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0f1520] border-b border-[#1e2d44]">
        <div className="flex items-center gap-2">
          {isLongCode && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded cursor-pointer hover:bg-[#1e2d44] transition-colors text-[#64748b] hover:text-[#94a3b8]"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
          <span className="text-xs font-medium text-[#64748b] uppercase tracking-wider">
            {languageDisplay}
          </span>
          {isStreaming && (
            <span className="flex items-center gap-1.5 ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] text-cyan-400/80 uppercase tracking-wider">streaming</span>
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          disabled={isStreaming}
          className={clsx(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all',
            isStreaming 
              ? 'text-[#3a4a5a] cursor-not-allowed'
              : copied
                ? 'text-emerald-400 bg-emerald-400/10'
                : 'text-[#64748b] hover:text-[#94a3b8] hover:bg-[#1e2d44]'
          )}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      
      {/* Code content */}
      <div className={clsx(
        'overflow-x-auto transition-all duration-200',
        isCollapsed && 'max-h-0 overflow-hidden'
      )}>
        <pre className="p-4 m-0 text-[13px] leading-relaxed">
          <code className={clsx(className, 'hljs')} {...props}>
            {children}
          </code>
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-0.5 bg-cyan-400/80 animate-pulse rounded-sm" />
          )}
        </pre>
      </div>
      
      {/* Collapsed indicator */}
      {isCollapsed && (
        <div 
          className="px-4 py-2 text-xs text-[#64748b] bg-[#0f1520]/50 cursor-pointer hover:text-[#94a3b8] transition-colors"
          onClick={() => setIsCollapsed(false)}
        >
          {lineCount} lines collapsed — click to expand
        </div>
      )}
    </div>
  )
})

const InlineCode = memo(function InlineCode({ 
  children, 
  ...props 
}: { 
  children: React.ReactNode
  node?: unknown
}) {
  return (
    <code 
      className="px-1.5 py-0.5 mx-0.5 rounded-md bg-[#1e2d44] text-[#e879f9] text-[0.9em] font-mono"
      {...props}
    >
      {children}
    </code>
  )
})

// Custom components for ReactMarkdown
function createComponents(isStreaming: boolean): Components {
  return {
    // Code blocks and inline code
    code({ className, children, ...props }) {
      const isInline = !className && typeof children === 'string' && !children.includes('\n')
      
      if (isInline) {
        return <InlineCode {...props}>{children}</InlineCode>
      }
      
      return (
        <CodeBlock className={className} isStreaming={isStreaming} {...props}>
          {children}
        </CodeBlock>
      )
    },
    
    // Pre wrapper - pass through since CodeBlock handles everything
    pre({ children }) {
      return <>{children}</>
    },
    
    // Headings with proper styling
    h1: ({ children }) => (
      <h1 className="text-xl font-bold text-[#e2e8f0] mt-6 mb-3 first:mt-0">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-lg font-semibold text-[#e2e8f0] mt-5 mb-2 first:mt-0">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-base font-semibold text-[#e2e8f0] mt-4 mb-2 first:mt-0">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-sm font-semibold text-[#e2e8f0] mt-3 mb-1 first:mt-0">{children}</h4>
    ),
    
    // Paragraphs
    p: ({ children }) => (
      <p className="text-[15px] leading-[1.75] text-[#c8d1dc] my-3 first:mt-0 last:mb-0">{children}</p>
    ),
    
    // Lists
    ul: ({ children }) => (
      <ul className="my-3 ml-4 space-y-1.5 list-none">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="my-3 ml-4 space-y-1.5 list-decimal list-inside marker:text-[#64748b]">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="text-[15px] leading-[1.65] text-[#c8d1dc] relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-[#3b82f6] before:font-bold">
        {children}
      </li>
    ),
    
    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="my-4 pl-4 border-l-2 border-[#3b82f6] text-[#94a3b8] italic">
        {children}
      </blockquote>
    ),
    
    // Links
    a: ({ href, children }) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-[#3b82f6] hover:text-[#60a5fa] underline underline-offset-2 transition-colors"
      >
        {children}
      </a>
    ),
    
    // Strong/Bold
    strong: ({ children }) => (
      <strong className="font-semibold text-[#e2e8f0]">{children}</strong>
    ),
    
    // Emphasis/Italic
    em: ({ children }) => (
      <em className="italic text-[#94a3b8]">{children}</em>
    ),
    
    // Horizontal rule
    hr: () => (
      <hr className="my-6 border-0 border-t border-[#1e2d44]" />
    ),
    
    // Tables
    table: ({ children }) => (
      <div className="my-4 overflow-x-auto rounded-lg border border-[#1e2d44]">
        <table className="w-full text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-[#0f1520] border-b border-[#1e2d44]">{children}</thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-[#1e2d44]">{children}</tbody>
    ),
    tr: ({ children }) => (
      <tr className="hover:bg-[#0f1520]/50 transition-colors">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">{children}</th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 text-[#c8d1dc]">{children}</td>
    ),
  }
}

export const MarkdownRenderer = memo(function MarkdownRenderer({ 
  content, 
  isStreaming = false 
}: MarkdownRendererProps) {
  // Memoize components to prevent recreation on every render
  const components = useMemo(() => createComponents(isStreaming), [isStreaming])
  
  // Handle empty content
  if (!content) {
    return isStreaming ? <StreamingCursor /> : null
  }

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
      {isStreaming && <StreamingCursor />}
    </div>
  )
})

// Streaming cursor component
function StreamingCursor() {
  return (
    <span className="inline-flex items-center gap-1 ml-1 align-middle">
      <span className="w-2 h-4 bg-[#3b82f6] rounded-sm animate-pulse" />
    </span>
  )
}

export default MarkdownRenderer

