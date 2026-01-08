import type { Category } from "../App";
import { 
  SquareMousePointer, 
  Network, 
  Database, 
  Server, 
  LockKeyhole, 
  Cloud, 
  ChartBar, 
  BugPlay, 
  Braces, 
  CircleEllipsis 
} from 'lucide-react';

export const categories: Category[] = [
    {
      id: 'frontend',
      name: 'Front-End',
      icon: SquareMousePointer,
      color: 'blue',
      decisions: [
        {
          id: '1.1',
          title: 'Framework / Library',
          description: 'The foundational choice that influences nearly every other front-end decision.',
          phase: 1,
          options: [
            { name: 'React', pros: ['Massive ecosystem', 'Job market', 'Flexibility', 'Mature patterns'], cons: ['Not a framework—assemble yourself', 'JSX learning curve', 'Ecosystem churn'], bestWhen: 'Maximum flexibility, experienced devs, existing React codebases' },
            { name: 'Vue', pros: ['Gentle learning curve', 'Excellent docs', 'Single-file components', 'Official router/state'], cons: ['Smaller ecosystem than React', 'Fewer senior Vue devs'], bestWhen: 'Approachable, batteries-included experience with less decision fatigue' },
            { name: 'Svelte / SvelteKit', pros: ['Compile-time = smaller bundles', 'Less boilerplate', 'True reactivity'], cons: ['Smaller ecosystem', 'Fewer jobs', 'Less battle-tested'], bestWhen: 'Performance critical, highly interactive UIs' },
            { name: 'Angular', pros: ['Full framework with opinions', 'DI, RxJS, CLI', 'Great for enterprise'], cons: ['Steep learning curve', 'Verbose', 'Slower iteration'], bestWhen: 'Large enterprise apps, strong conventions needed' },
            { name: 'Solid', pros: ['React-like API', 'Truly reactive', 'Better performance'], cons: ['Very small ecosystem', 'Emerging'], bestWhen: 'React ergonomics with Svelte-like performance' },
            { name: 'HTMX + Server Templates', pros: ['Simplicity', 'Minimal JS', 'Server-driven'], cons: ['Limited interactivity', 'Not for complex SPAs'], bestWhen: 'Simple apps, backend-heavy skills' },
          ],
          questions: ['What is the team\'s existing expertise?', 'How complex is the UI interactivity?', 'How important is hiring/onboarding?', 'Expected lifespan (2 years vs 10 years)?']
        },
        {
          id: '1.2',
          title: 'Language & Type System',
          description: 'Type safety and developer productivity tradeoffs.',
          phase: null,
          options: [
            { name: 'TypeScript (Strict)', pros: ['Catches bugs at compile time', 'Excellent IDE support', 'Self-documenting', 'Confident refactoring'], cons: ['Build step overhead', 'Learning curve for edge cases', 'Occasional type gymnastics'], bestWhen: 'Codebases expected to scale, teams > 2, long-lived projects' },
            { name: 'TypeScript (Gradual)', pros: ['Some benefits without full investment', 'Easier migration'], cons: ['False sense of security if `any` overused', 'Inconsistent DX'], bestWhen: 'Migrating existing JS codebases, teams new to TS' },
            { name: 'JavaScript (ES6+)', pros: ['No build step required', 'Simpler tooling', 'Faster iteration for prototypes'], cons: ['Runtime errors', 'Harder refactoring', 'Less self-documenting'], bestWhen: 'Prototypes, very small projects, solo developers' },
          ],
          questions: ['How large will the codebase grow?', 'How many developers will work on this?', 'Is there an existing JS codebase?', 'How critical is catching bugs before production?']
        },
        {
          id: '1.3',
          title: 'Web Rendering Strategy',
          description: 'One of the most consequential decisions, affecting SEO, performance, infrastructure costs.',
          phase: 1,
          options: [
            { name: 'CSR / SPA', pros: ['Simple deployment (static files)', 'Rich interactivity', 'Clear mental model'], cons: ['Poor SEO', 'Slow initial load', 'Blank screen until JS loads'], bestWhen: 'Authenticated dashboards, internal tools, apps behind login' },
            { name: 'SSR', pros: ['Good SEO', 'Fast First Contentful Paint', 'Works without JS'], cons: ['Server required', 'Increased complexity', 'Hydration cost'], bestWhen: 'Content-heavy sites needing SEO, e-commerce' },
            { name: 'SSG', pros: ['Blazing fast (CDN-cached)', 'Excellent SEO', 'No server at runtime'], cons: ['Build times scale with content', 'Stale until rebuild'], bestWhen: 'Blogs, documentation, marketing sites' },
            { name: 'ISR', pros: ['Best of SSG + SSR—static speed with freshness'], cons: ['Vendor-specific', 'Cache invalidation complexity'], bestWhen: 'Content sites with frequent updates, e-commerce product pages' },
            { name: 'Islands Architecture', pros: ['Ship minimal JS', 'Hydrate only interactive components'], cons: ['Requires rethinking component boundaries', 'Framework-specific'], bestWhen: 'Content-heavy sites with isolated interactive widgets' },
            { name: 'React Server Components', pros: ['Server-rendered without shipping JS to client', 'Fine-grained control'], cons: ['New paradigm', 'Next.js specific currently'], bestWhen: 'Next.js apps wanting optimal bundle sizes' },
          ],
          questions: ['Is SEO critical?', 'Static vs dynamic content ratio?', 'How frequently does content change?', 'Budget for server infrastructure?']
        },
        {
          id: '1.4',
          title: 'Frontend Architecture Pattern',
          description: 'How you organize your frontend code at scale.',
          phase: 2,
          options: [
            { name: 'Feature-Based / Vertical Slices', pros: ['Co-location of related code', 'Easier to understand features', 'Scales well'], cons: ['Potential code duplication', 'Harder to share across features'], bestWhen: 'Medium to large apps, teams organized by feature' },
            { name: 'Atomic Design', pros: ['Systematic component hierarchy', 'Promotes reusability'], cons: ['Can feel over-engineered', 'Naming debates'], bestWhen: 'Design-system-heavy projects, large component libraries' },
            { name: 'Clean Architecture / Hexagonal', pros: ['Framework-agnostic business logic', 'Highly testable'], cons: ['More boilerplate', 'Can feel heavyweight'], bestWhen: 'Complex business logic, apps expected to survive framework changes' },
            { name: 'Container/Presenter Pattern', pros: ['Separates data-fetching from UI', 'Improves testability'], cons: ['More files', 'Unnecessary indirection for simple components'], bestWhen: 'Highly testable UI components needed' },
          ],
          questions: ['How large is the application expected to become?', 'How complex is the business logic?', 'How is the team organized?']
        },
        {
          id: '1.5',
          title: 'State Management',
          description: 'Managing application state across components.',
          phase: 2,
          options: [
            { name: 'Component Local State', pros: ['Simple', 'Co-located', 'No extra dependencies'], cons: ['Prop drilling', 'Doesn\'t scale for complex state'], bestWhen: 'Simple apps, component-scoped state' },
            { name: 'Context API', pros: ['Built-in', 'No external deps', 'Good for low-frequency updates'], cons: ['Re-renders all consumers on update'], bestWhen: 'Theme, auth, locale—state that changes infrequently' },
            { name: 'Redux / Redux Toolkit', pros: ['Predictable', 'Time-travel debugging', 'Middleware support'], cons: ['Boilerplate', 'Learning curve', 'Overkill for simple apps'], bestWhen: 'Complex state with many reducers, middleware needs' },
            { name: 'Zustand', pros: ['Minimal API', 'TypeScript-friendly', 'No boilerplate'], cons: ['Less structured than Redux', 'Fewer guardrails'], bestWhen: 'Medium complexity apps wanting Redux patterns without ceremony' },
            { name: 'Jotai / Recoil', pros: ['Atomic state model', 'Fine-grained reactivity', 'Composable'], cons: ['Different mental model', 'Recoil maintenance concerns'], bestWhen: 'Complex interdependencies, derived state common' },
            { name: 'TanStack Query / SWR', pros: ['Handles caching, revalidation, loading/error states'], cons: ['Not for client-only state'], bestWhen: 'Most "state" is actually cached server data' },
            { name: 'XState', pros: ['State machines = explicit states', 'Prevents impossible states', 'Visualizable'], cons: ['Learning curve', 'Verbose for trivial cases'], bestWhen: 'Complex UI flows, wizards, async processes' },
          ],
          questions: ['How much state is server data vs truly client-only?', 'How complex are state transitions?', 'Do you need time-travel debugging?']
        },
        {
          id: '1.7',
          title: 'Styling Approach',
          description: 'How styles are written, scoped, and maintained.',
          phase: 4,
          options: [
            { name: 'Tailwind CSS', pros: ['Utility-first = fast iteration', 'Consistent design tokens', 'Small production builds'], cons: ['Verbose HTML', 'Learning curve', 'Opinionated'], bestWhen: 'Rapid prototyping, consistent design system' },
            { name: 'CSS Modules', pros: ['Scoped styles', 'No runtime cost', 'Existing CSS knowledge'], cons: ['Separate files', 'Limited dynamic styling'], bestWhen: 'Scoped CSS without runtime cost' },
            { name: 'CSS-in-JS (Styled Components)', pros: ['Co-located styles', 'Dynamic styling', 'Full JS power'], cons: ['Runtime cost', 'Bundle size', 'SSR complexity'], bestWhen: 'Highly dynamic styling needs, component libraries' },
            { name: 'Vanilla Extract', pros: ['Zero-runtime CSS-in-JS', 'TypeScript support', 'Build-time'], cons: ['Build step required', 'Less mature ecosystem'], bestWhen: 'CSS-in-JS DX without runtime cost' },
            { name: 'Sass/SCSS', pros: ['Mature', 'Variables/mixins/nesting', 'Large ecosystem'], cons: ['Global scope issues', 'Requires naming conventions'], bestWhen: 'Existing Sass codebases, traditional CSS with superpowers' },
          ],
          questions: ['How dynamic is your styling?', 'How important is runtime performance?', 'Building a component library or application?']
        },
        {
          id: '1.10',
          title: 'Build Tooling & Bundlers',
          description: 'Development and production build pipeline.',
          phase: 3,
          options: [
            { name: 'Vite', pros: ['Blazing fast dev server (native ESM)', 'Good defaults', 'Framework-agnostic'], cons: ['Different dev/prod behavior', 'Some edge cases'], bestWhen: 'New projects, fast DX priority' },
            { name: 'Webpack', pros: ['Mature', 'Handles any use case', 'Massive plugin ecosystem'], cons: ['Complex configuration', 'Slower than modern alternatives'], bestWhen: 'Complex build requirements, existing setups' },
            { name: 'Turbopack', pros: ['Rust-based', 'Incremental', 'Next.js native'], cons: ['Next.js specific', 'Still maturing'], bestWhen: 'Next.js projects wanting fastest builds' },
            { name: 'esbuild', pros: ['Extremely fast', 'Simple API'], cons: ['Less feature-rich', 'No HMR out of box'], bestWhen: 'Build scripts, libraries, raw speed' },
          ],
          questions: ['How important is dev server speed?', 'How complex are build requirements?', 'Does framework dictate the bundler?']
        },
      ]
    },
    {
      id: 'client-server',
      name: 'Client-Server Interface',
      icon: Network,
      color: 'cyan',
      decisions: [
        {
          id: '2.1',
          title: 'API Paradigm',
          description: 'How client and server communicate.',
          phase: 2,
          options: [
            { name: 'REST', pros: ['Universal', 'Cacheable (HTTP)', 'Well-understood', 'Great tooling'], cons: ['Over-fetching/under-fetching', 'Multiple round-trips', 'Manual type safety'], bestWhen: 'Public APIs, simple CRUD, HTTP caching matters' },
            { name: 'GraphQL', pros: ['Client specifies exact data needs', 'Single endpoint', 'Introspection', 'Strong typing'], cons: ['Complexity (resolvers, N+1)', 'Caching harder', 'Overkill for simple apps'], bestWhen: 'Complex data requirements, multiple clients' },
            { name: 'tRPC', pros: ['End-to-end type safety', 'No codegen', 'Feels like function calls'], cons: ['TypeScript-only', 'Tight coupling', 'Monorepo typically needed'], bestWhen: 'Full-stack TypeScript, monorepo setups' },
            { name: 'gRPC', pros: ['High performance', 'Strong typing (protobuf)', 'Streaming', 'Multi-language'], cons: ['Browser support limited', 'Protobuf learning curve'], bestWhen: 'Microservices communication, high-performance' },
            { name: 'Server Actions', pros: ['Co-located server code', 'No API layer', 'Type-safe'], cons: ['Framework lock-in', 'Less clear boundaries'], bestWhen: 'Meta-frameworks that support them' },
          ],
          questions: ['Is the API public or internal-only?', 'How varied are data requirements?', 'Full-stack TypeScript or polyglot?', 'How important is HTTP-level caching?']
        },
        {
          id: '2.3',
          title: 'Real-Time Communication',
          description: 'Enabling live, bidirectional data flow.',
          phase: null,
          options: [
            { name: 'WebSockets', pros: ['True bidirectional', 'Low latency'], cons: ['Connection management', 'Different infra', 'Scaling complexity'], bestWhen: 'Chat, live collaboration, gaming' },
            { name: 'Server-Sent Events (SSE)', pros: ['Simple server-to-client', 'Uses HTTP', 'Auto-reconnect'], cons: ['Unidirectional only', 'Connection limits in HTTP/1.1'], bestWhen: 'Notifications, live feeds' },
            { name: 'Long Polling', pros: ['Works everywhere', 'Simple concept'], cons: ['Inefficient', 'Higher latency'], bestWhen: 'Fallback when WebSockets unavailable' },
            { name: 'WebRTC', pros: ['Peer-to-peer', 'Lowest latency'], cons: ['Complex', 'NAT traversal issues'], bestWhen: 'Video/audio calls, P2P file sharing' },
            { name: 'Managed (Pusher, Ably)', pros: ['Handles scaling', 'Presence', 'Reconnection'], cons: ['Cost', 'Vendor dependency'], bestWhen: 'Don\'t want to manage WebSocket infrastructure' },
          ],
          questions: ['Unidirectional or bidirectional?', 'What latency is acceptable?', 'Infrastructure expertise for WebSocket scaling?']
        },
      ]
    },
    {
      id: 'backend',
      name: 'Back-End',
      icon: Server,
      color: 'violet',
      decisions: [
        {
          id: '3.1',
          title: 'Runtime Environment',
          description: 'The platform your server-side code runs on.',
          phase: 1,
          options: [
            { name: 'Node.js', pros: ['JavaScript everywhere', 'Massive ecosystem', 'Async I/O'], cons: ['Single-threaded', 'CPU-bound performance', 'Callback complexity'], bestWhen: 'Full-stack JS/TS teams, I/O-heavy workloads' },
            { name: 'Deno', pros: ['TypeScript native', 'Secure by default', 'Modern APIs', 'Built-in tooling'], cons: ['Smaller ecosystem', 'npm compatibility imperfect'], bestWhen: 'Greenfield projects, security-conscious' },
            { name: 'Bun', pros: ['Fast (Zig-based)', 'Node compatible', 'All-in-one'], cons: ['Newer', 'Some compatibility gaps'], bestWhen: 'Performance-sensitive, cutting-edge teams' },
            { name: 'Python', pros: ['Excellent for data/ML', 'Readable', 'Mature ecosystem'], cons: ['GIL limits concurrency', 'Slower than compiled'], bestWhen: 'Data-heavy apps, ML integration' },
            { name: 'Go', pros: ['Fast', 'Concurrent (goroutines)', 'Simple', 'Single binary'], cons: ['Verbose', 'Different paradigm'], bestWhen: 'High-performance services, microservices' },
            { name: 'Rust', pros: ['Maximum performance', 'Memory safety', 'No GC'], cons: ['Steep learning curve', 'Longer development time'], bestWhen: 'Performance-critical systems' },
          ],
          questions: ['What language expertise does the team have?', 'Is this I/O-bound or CPU-bound?', 'How important is raw performance vs development speed?']
        },
        {
          id: '3.2',
          title: 'Backend Framework',
          description: 'The structure and conventions for your API.',
          phase: 2,
          options: [
            { name: 'Express', pros: ['Minimal', 'Flexible', 'Massive ecosystem'], cons: ['Manual everything', 'Minimal structure'], bestWhen: 'Simple APIs, full control needed' },
            { name: 'Fastify', pros: ['Fast', 'Schema-based validation', 'Plugin architecture'], cons: ['Smaller ecosystem than Express'], bestWhen: 'Performance-sensitive APIs with structure' },
            { name: 'NestJS', pros: ['Angular-like structure', 'DI, modules, decorators', 'Enterprise-ready'], cons: ['Learning curve', 'Can feel heavy'], bestWhen: 'Large teams, enterprise apps' },
            { name: 'Hono', pros: ['Ultra-light', 'Works everywhere (edge, Node, Bun)', 'Fast'], cons: ['Minimal, less batteries-included'], bestWhen: 'Edge functions, serverless, lightweight APIs' },
            { name: 'FastAPI (Python)', pros: ['Modern', 'Async', 'Auto-generated OpenAPI'], cons: ['Python-specific', 'Less batteries than Django'], bestWhen: 'Modern Python APIs, auto docs' },
            { name: 'Django', pros: ['Batteries-included', 'Mature', 'Admin panel', 'ORM'], cons: ['Monolithic', 'Can feel heavy'], bestWhen: 'Full-featured web apps, everything included' },
          ],
          questions: ['How opinionated do you want the framework?', 'How large is the team?', 'Is this API-only or full web application?']
        },
        {
          id: '3.3',
          title: 'Backend Architecture Pattern',
          description: 'High-level structure of your server application.',
          phase: null,
          options: [
            { name: 'Layered / N-Tier', pros: ['Simple', 'Well-understood', 'Separation of concerns'], cons: ['Can become anemic domain', 'Layers for layers\' sake'], bestWhen: 'CRUD-heavy apps, traditional web apps' },
            { name: 'Clean Architecture / Hexagonal', pros: ['Framework-agnostic domain', 'Highly testable', 'Clear dependency rules'], cons: ['More boilerplate', 'Heavyweight for simple apps'], bestWhen: 'Complex business logic, domain-driven teams' },
            { name: 'CQRS', pros: ['Optimized read/write models', 'Scalability'], cons: ['Complexity', 'Eventual consistency challenges'], bestWhen: 'High read/write ratio disparity' },
            { name: 'Microservices', pros: ['Independent deployment', 'Technology freedom', 'Team autonomy'], cons: ['Distributed system complexity', 'Operational overhead'], bestWhen: 'Large teams, diverse scaling needs' },
            { name: 'Modular Monolith', pros: ['Monolith simplicity + module boundaries', 'Can extract services later'], cons: ['Discipline required', 'Single deployment'], bestWhen: 'Starting point before microservices' },
            { name: 'Serverless / FaaS', pros: ['Scale to zero', 'Pay per use', 'No server management'], cons: ['Cold starts', 'Vendor lock-in', 'Stateless constraints'], bestWhen: 'Variable traffic, cost optimization' },
          ],
          questions: ['How complex is the business domain?', 'What is the team size?', 'Is this new or evolution of existing?']
        },
      ]
    },
    {
      id: 'data',
      name: 'Data Layer',
      icon: Database,
      color: 'emerald',
      decisions: [
        {
          id: '4.1',
          title: 'Database Paradigm',
          description: 'The fundamental data model and query approach.',
          phase: 1,
          options: [
            { name: 'Relational (SQL)', pros: ['ACID', 'Joins', 'Mature', 'Flexible querying', 'Schema enforcement'], cons: ['Schema migrations', 'Horizontal scaling harder'], bestWhen: 'Most applications, structured data, complex queries' },
            { name: 'Document (NoSQL)', pros: ['Flexible schema', 'Horizontal scaling', 'Denormalized access'], cons: ['No/limited joins', 'Eventual consistency', 'Query limitations'], bestWhen: 'Variable schema, hierarchical documents, rapid iteration' },
            { name: 'Key-Value', pros: ['Simple', 'Fast', 'Scalable'], cons: ['Limited querying', 'Just lookups'], bestWhen: 'Caching, session storage, simple lookups' },
            { name: 'Graph', pros: ['Relationship-first', 'Traversal queries'], cons: ['Different paradigm', 'Limited ecosystem'], bestWhen: 'Highly connected data, social networks, recommendations' },
            { name: 'Time-Series', pros: ['Optimized for temporal data', 'Retention policies'], cons: ['Specific use case'], bestWhen: 'Metrics, IoT, financial data' },
            { name: 'Vector', pros: ['Similarity search', 'ML embeddings'], cons: ['Specialized use case'], bestWhen: 'AI/ML applications, semantic search' },
          ],
          questions: ['How structured is your data?', 'Consistency requirements?', 'How important are complex queries and joins?', 'Scaling expectations?']
        },
        {
          id: '4.2',
          title: 'Specific Database Choice',
          description: 'The actual database technology to use.',
          phase: null,
          options: [
            { name: 'PostgreSQL', pros: ['Feature-rich (JSONB, arrays, FTS)', 'Rock-solid', 'Open-source'], cons: ['Tuning can be complex'], bestWhen: 'Default choice, power and flexibility needed' },
            { name: 'MySQL / MariaDB', pros: ['Simple', 'Fast reads', 'Widely known'], cons: ['Fewer features than Postgres'], bestWhen: 'Simpler needs, read-heavy workloads' },
            { name: 'SQLite', pros: ['Embedded', 'Zero config', 'File-based'], cons: ['Write concurrency limitations'], bestWhen: 'Local-first apps, embedded, edge, single-server' },
            { name: 'MongoDB', pros: ['Flexible', 'Popular', 'Good tooling', 'Atlas managed'], cons: ['Not truly relational'], bestWhen: 'Document-oriented data, rapid prototyping' },
            { name: 'DynamoDB', pros: ['Managed', 'Serverless', 'Scale'], cons: ['AWS lock-in', 'Access patterns must be known upfront'], bestWhen: 'AWS shops, serverless architecture' },
            { name: 'PlanetScale / Neon', pros: ['Serverless', 'Branching', 'Scale-to-zero'], cons: ['Newer', 'Some limitations'], bestWhen: 'Serverless database needs' },
          ],
          questions: ['What expertise exists on the team?', 'Specific features needed?', 'Is managed/serverless preferred?']
        },
        {
          id: '4.4',
          title: 'ORM / Query Builder / Raw SQL',
          description: 'How you interact with your database in code.',
          phase: null,
          options: [
            { name: 'Prisma', pros: ['Great DX', 'Type generation', 'Migrations', 'Intuitive API'], cons: ['Abstraction limitations', 'Binary dependency'], bestWhen: 'TypeScript projects, DX is priority' },
            { name: 'Drizzle', pros: ['SQL-like syntax but type-safe', 'Lighter than Prisma', 'No binary'], cons: ['Newer', 'Less mature'], bestWhen: 'Want ORM benefits but closer to SQL' },
            { name: 'TypeORM / Sequelize', pros: ['Type-safe models', 'Migrations', 'Abstracts SQL'], cons: ['Abstraction leaks', 'N+1 problems'], bestWhen: 'Rapid development, less SQL comfort' },
            { name: 'Query Builder (Knex, Kysely)', pros: ['SQL control with type safety', 'Composable'], cons: ['More verbose than ORM'], bestWhen: 'SQL control but want type safety' },
            { name: 'Raw SQL', pros: ['Full control', 'Maximum performance'], cons: ['No type safety', 'SQL injection risk'], bestWhen: 'Performance-critical queries, SQL experts' },
          ],
          questions: ['How comfortable is the team with SQL?', 'How complex are the queries?', 'How important is type safety?']
        },
        {
          id: '4.5',
          title: 'Caching Strategy',
          description: 'Improving performance through data caching.',
          phase: null,
          options: [
            { name: 'In-Memory (LRU)', pros: ['Simple', 'No external dependency'], cons: ['Per-instance', 'Lost on restart'], bestWhen: 'Single-instance apps, small datasets' },
            { name: 'Redis', pros: ['Fast', 'Versatile', 'Shared across instances'], cons: ['Additional infrastructure'], bestWhen: 'Most caching needs, sessions, rate limiting' },
            { name: 'CDN Caching', pros: ['Edge caching', 'Global'], cons: ['Cache invalidation complexity'], bestWhen: 'Static assets, public API responses' },
            { name: 'HTTP Caching', pros: ['Standard', 'Client-side', 'CDN-compatible'], cons: ['Limited to HTTP semantics'], bestWhen: 'API responses, static resources' },
          ],
          questions: ['Is the app distributed?', 'What are you caching?', 'How critical is cache invalidation?']
        },
      ]
    },
    {
      id: 'auth',
      name: 'Auth & Security',
      icon: LockKeyhole,
      color: 'rose',
      decisions: [
        {
          id: '5.1',
          title: 'Authentication Strategy',
          description: 'How users prove their identity.',
          phase: 2,
          options: [
            { name: 'Email/Password', pros: ['Familiar', 'No external dependency'], cons: ['Password security burden', 'Credential stuffing risk'], bestWhen: 'Traditional apps, users expect email login' },
            { name: 'Passwordless (Magic Links)', pros: ['No passwords to manage', 'Simpler UX'], cons: ['Email/SMS delivery dependency'], bestWhen: 'Modern consumer apps, password fatigue' },
            { name: 'Social Login (OAuth)', pros: ['Reduced friction', 'Offload identity'], cons: ['Provider dependency', 'Privacy concerns'], bestWhen: 'Consumer apps, users expect social login' },
            { name: 'SSO / SAML', pros: ['Enterprise requirement', 'Centralized identity'], cons: ['Complexity', 'Often paid feature'], bestWhen: 'B2B/enterprise apps' },
            { name: 'Passkeys / WebAuthn', pros: ['Phishing-resistant', 'Passwordless', 'Modern'], cons: ['Browser support', 'User education', 'Recovery complexity'], bestWhen: 'Security-critical apps, modern consumer apps' },
          ],
          questions: ['Who are your users?', 'What auth methods do they expect?', 'How critical is security vs friction?']
        },
        {
          id: '5.3',
          title: 'Authorization Model',
          description: 'How you control what users can do.',
          phase: null,
          options: [
            { name: 'RBAC (Role-Based)', pros: ['Simple', 'Well-understood', 'Common pattern'], cons: ['Can explode with many roles', 'Not resource-specific'], bestWhen: 'Clear roles (admin, user, moderator)' },
            { name: 'ABAC (Attribute-Based)', pros: ['Fine-grained', 'Flexible policies'], cons: ['Complex', 'Harder to reason about'], bestWhen: 'Complex authorization, regulatory requirements' },
            { name: 'Permission-Based', pros: ['Granular', 'Composable'], cons: ['Many permissions to manage'], bestWhen: 'Roles too coarse but ABAC overkill' },
            { name: 'Resource-Based (Ownership)', pros: ['Users own their data', 'Simple model'], cons: ['Limited for shared resources'], bestWhen: 'Multi-tenant apps, user-owned data' },
            { name: 'Policy-Based (OPA, Cerbos)', pros: ['Externalized policy', 'Flexible', 'Auditable'], cons: ['Additional system', 'Learning curve'], bestWhen: 'Complex policies, microservices' },
          ],
          questions: ['How complex are authorization rules?', 'Is authorization resource-specific?', 'Do you need fine-grained sharing?']
        },
        {
          id: '5.4',
          title: 'Auth Provider',
          description: 'Build vs buy your authentication system.',
          phase: null,
          options: [
            { name: 'Build Your Own', pros: ['Full control', 'No cost'], cons: ['Security risk if done wrong', 'Significant effort'], bestWhen: 'Very simple needs OR dedicated security expertise' },
            { name: 'Auth.js / NextAuth', pros: ['Open-source', 'Framework-integrated', 'Many providers'], cons: ['Can be complex', 'Some footguns'], bestWhen: 'Next.js apps, open-source preference' },
            { name: 'Clerk', pros: ['Excellent DX', 'UI components', 'Comprehensive'], cons: ['Cost', 'Vendor lock-in'], bestWhen: 'DX matters, budget allows' },
            { name: 'Auth0', pros: ['Feature-rich', 'Enterprise-ready'], cons: ['Cost', 'Can be overkill'], bestWhen: 'Enterprise needs, complex requirements' },
            { name: 'Supabase Auth', pros: ['Open-source', 'Postgres-integrated'], cons: ['Supabase ecosystem'], bestWhen: 'Supabase projects' },
            { name: 'Firebase Auth', pros: ['Simple', 'Google integration', 'Free tier'], cons: ['GCP lock-in'], bestWhen: 'Firebase ecosystem, simple needs' },
          ],
          questions: ['Is this B2C or B2B?', 'Open-source or managed preferred?', 'What is the budget?']
        },
      ]
    },
    {
      id: 'devops',
      name: 'DevOps & Infrastructure',
      icon: Cloud,
      color: 'amber',
      decisions: [
        {
          id: '7.1',
          title: 'Hosting Model',
          description: 'How your application is deployed and served.',
          phase: 1,
          options: [
            { name: 'Serverless / FaaS', pros: ['Scale to zero', 'Pay per use', 'No ops'], cons: ['Cold starts', 'Vendor lock-in', 'Constraints'], bestWhen: 'Variable traffic, cost optimization' },
            { name: 'Containers (K8s, ECS)', pros: ['Portable', 'Scalable', 'Consistent environments'], cons: ['Operational complexity'], bestWhen: 'Microservices, team has k8s experience' },
            { name: 'PaaS (Heroku, Render, Railway)', pros: ['Simple deployment', 'Managed'], cons: ['Less control', 'Cost at scale'], bestWhen: 'Startups, small teams, want simplicity' },
            { name: 'VPS / Bare Metal', pros: ['Full control', 'Predictable cost'], cons: ['Manual everything', 'Scaling is your problem'], bestWhen: 'Specific requirements, cost optimization' },
            { name: 'Edge Computing', pros: ['Low latency globally'], cons: ['Stateless constraints', 'Complexity'], bestWhen: 'Global low-latency needs' },
          ],
          questions: ['What is the team\'s ops expertise?', 'How variable is traffic?', 'Budget model (predictable vs pay-per-use)?']
        },
        {
          id: '7.2',
          title: 'Compute Platform',
          description: 'Where your code actually runs.',
          phase: null,
          options: [
            { name: 'Vercel', pros: ['Excellent DX for Next.js', 'Edge functions', 'Previews'], cons: ['Vendor lock-in', 'Cost at scale'], bestWhen: 'Next.js projects, excellent DX' },
            { name: 'Railway / Render', pros: ['Simple Heroku-like', 'Modern'], cons: ['Less feature-rich than big clouds'], bestWhen: 'Startups, side projects, simplicity' },
            { name: 'Fly.io', pros: ['Global edge compute', 'Docker-based'], cons: ['Newer', 'Less ecosystem'], bestWhen: 'Global distribution, Docker apps' },
            { name: 'AWS (ECS, Lambda, EC2)', pros: ['Everything available', 'Scalable', 'Mature'], cons: ['Complexity', 'Can be expensive'], bestWhen: 'Enterprise, complex needs' },
            { name: 'Cloudflare Workers', pros: ['Edge by default', 'Cheap', 'Fast'], cons: ['V8 isolate constraints'], bestWhen: 'Edge functions, simple APIs' },
          ],
          questions: ['What framework/runtime?', 'Cloud experience?', 'Is global distribution needed?']
        },
        {
          id: '7.4',
          title: 'CI/CD',
          description: 'Automated testing and deployment pipelines.',
          phase: 3,
          options: [
            { name: 'GitHub Actions', pros: ['Integrated with GitHub', 'Generous free tier', 'Marketplace'], cons: ['YAML config', 'Vendor lock-in'], bestWhen: 'GitHub repos, most projects' },
            { name: 'GitLab CI', pros: ['Integrated with GitLab', 'Powerful'], cons: ['GitLab ecosystem'], bestWhen: 'GitLab users' },
            { name: 'CircleCI', pros: ['Powerful', 'Good caching', 'Orbs'], cons: ['Cost', 'Complexity'], bestWhen: 'Complex build needs' },
            { name: 'Dagger', pros: ['Pipelines as code (Go, Python, TS)', 'Portable'], cons: ['Learning curve', 'Newer'], bestWhen: 'Want CI written in real languages' },
          ],
          questions: ['Where is the code hosted?', 'What is the budget?', 'How complex are build pipelines?']
        },
      ]
    },
    {
      id: 'observability',
      name: 'Observability',
      icon: ChartBar,
      color: 'cyan',
      decisions: [
        {
          id: '8.1',
          title: 'Logging',
          description: 'How application events are recorded and stored.',
          phase: 4,
          options: [
            { name: 'Structured Logging (JSON)', pros: ['Parseable', 'Queryable', 'Context-rich'], cons: ['More verbose', 'Requires tooling'], bestWhen: 'Any production system' },
            { name: 'Managed (DataDog, Logtail)', pros: ['Search', 'Alerts', 'Retention'], cons: ['Cost at volume'], bestWhen: 'Production apps needing search/alerts' },
            { name: 'Self-Hosted (ELK, Loki)', pros: ['Control', 'No per-GB cost'], cons: ['Operational burden'], bestWhen: 'High volume, expertise available' },
            { name: 'Cloud-Native (CloudWatch)', pros: ['Integrated with cloud'], cons: ['Lock-in', 'Cost'], bestWhen: 'AWS/GCP native apps' },
          ],
          questions: ['What volume of logs expected?', 'Do you need log analysis and alerting?', 'Budget for logging?']
        },
        {
          id: '8.4',
          title: 'Error Tracking',
          description: 'Capturing and managing application errors.',
          phase: 4,
          options: [
            { name: 'Sentry', pros: ['Excellent error grouping', 'Context', 'Stack traces', 'Release tracking'], cons: ['Cost at volume'], bestWhen: 'Most applications, industry standard' },
            { name: 'Bugsnag', pros: ['Good mobile support', 'Stability metrics'], cons: ['Less popular than Sentry'], bestWhen: 'Mobile apps especially' },
            { name: 'DataDog Error Tracking', pros: ['Integrated with DataDog'], cons: ['If you don\'t use DataDog, overkill'], bestWhen: 'DataDog users' },
          ],
          questions: ['What is the expected error volume?', 'Is release tracking important?', 'What platforms?']
        },
      ]
    },
    {
      id: 'testing',
      name: 'Testing Strategy',
      icon: BugPlay,
      color: 'emerald',
      decisions: [
        {
          id: '9.1',
          title: 'Testing Philosophy',
          description: 'Your overall approach to testing.',
          phase: 3,
          options: [
            { name: 'Testing Pyramid', pros: ['Fast feedback', 'High coverage', 'Traditional wisdom'], cons: ['Mocking overhead', 'Can miss integration bugs'], bestWhen: 'Most applications' },
            { name: 'Testing Trophy', pros: ['More confidence per test', 'Less mocking'], cons: ['Slower tests', 'More setup'], bestWhen: 'Integration points are critical' },
            { name: 'E2E Heavy', pros: ['Tests real user flows'], cons: ['Slow', 'Flaky', 'Expensive to maintain'], bestWhen: 'User flows are paramount' },
          ],
          questions: ['What is the risk tolerance?', 'How fast does the test suite need to be?', 'Deployment frequency?']
        },
        {
          id: '9.2',
          title: 'Testing Framework',
          description: 'Tools for writing and running tests.',
          phase: 3,
          options: [
            { name: 'Vitest', pros: ['Fast (Vite-based)', 'Jest-compatible', 'Native ESM'], cons: ['Newer'], bestWhen: 'Modern projects, Vite projects' },
            { name: 'Jest', pros: ['Mature', 'Widely used', 'Good ecosystem'], cons: ['Slower than Vitest', 'Config complexity'], bestWhen: 'Existing Jest codebases, React projects' },
            { name: 'Playwright', pros: ['Fast', 'Reliable', 'Multiple browsers', 'Great DX'], cons: ['Learning curve'], bestWhen: 'Modern default choice for E2E' },
            { name: 'Cypress', pros: ['Great DX', 'Time-travel debugging'], cons: ['Mostly Chromium', 'Slower'], bestWhen: 'Team prefers Cypress, existing suites' },
          ],
          questions: ['What bundler/runtime?', 'Existing test suite?', 'How important is test speed?']
        },
      ]
    },
    {
      id: 'dx',
      name: 'Developer Experience',
      icon: Braces,
      color: 'violet',
      decisions: [
        {
          id: '10.1',
          title: 'Monorepo vs Polyrepo',
          description: 'Code repository structure for your projects.',
          phase: 3,
          options: [
            { name: 'Monorepo', pros: ['Atomic changes', 'Code sharing easy', 'Unified tooling'], cons: ['Tooling complexity', 'Scaling challenges', 'Longer CI'], bestWhen: 'Full-stack apps, shared code, coordinated releases' },
            { name: 'Polyrepo', pros: ['Clear ownership', 'Independent deployment', 'Simpler repos'], cons: ['Dependency hell', 'Code duplication', 'Cross-repo changes hard'], bestWhen: 'Independent teams, clear boundaries' },
            { name: 'Monorepo + Turborepo', pros: ['Fast incremental builds', 'Caching', 'Remote caching'], cons: ['Turborepo-specific'], bestWhen: 'JS/TS monorepos wanting speed' },
            { name: 'Monorepo + Nx', pros: ['Comprehensive', 'Affected testing', 'Generators'], cons: ['Learning curve', 'Opinionated'], bestWhen: 'Large monorepos, enterprise' },
          ],
          questions: ['How many apps/packages?', 'Is code shared between them?', 'How independent are deployments?']
        },
        {
          id: '10.2',
          title: 'Code Quality Tools',
          description: 'Automated code analysis and formatting.',
          phase: 3,
          options: [
            { name: 'ESLint + Prettier', pros: ['Catches bugs', 'Enforces style', 'Ends debates'], cons: ['Config complexity', 'Two tools'], bestWhen: 'All JavaScript/TypeScript projects' },
            { name: 'Biome', pros: ['Fast (Rust)', 'ESLint + Prettier in one'], cons: ['Newer', 'Less plugin ecosystem'], bestWhen: 'Want all-in-one, fast' },
            { name: 'TypeScript Strict', pros: ['Maximum type safety'], cons: ['More errors to fix'], bestWhen: 'Projects wanting maximum safety' },
            { name: 'Husky + lint-staged', pros: ['Pre-commit hooks', 'Catch issues early'], cons: ['Can slow commits'], bestWhen: 'Enforce quality gates' },
          ],
          questions: ['What quality gates are needed?', 'Is pre-commit enforcement acceptable?']
        },
        {
          id: '10.4',
          title: 'Feature Flags',
          description: 'Controlling feature rollout dynamically.',
          phase: 4,
          options: [
            { name: 'Environment Variables', pros: ['Simple'], cons: ['Requires redeploy', 'No gradual rollout'], bestWhen: 'Simple on/off flags' },
            { name: 'LaunchDarkly', pros: ['Comprehensive', 'Targeting', 'Experiments'], cons: ['Cost'], bestWhen: 'Enterprise, complex feature management' },
            { name: 'Unleash', pros: ['Open-source', 'Self-hostable'], cons: ['Less polished than LD'], bestWhen: 'Self-hosting, cost-sensitive' },
            { name: 'PostHog Feature Flags', pros: ['Integrated with analytics'], cons: ['PostHog ecosystem'], bestWhen: 'PostHog users' },
          ],
          questions: ['How granular is targeting needed?', 'Is A/B testing needed?', 'Is self-hosting required?']
        },
      ]
    },
    {
      id: 'cross-cutting',
      name: 'Cross-Cutting Concerns',
      icon: CircleEllipsis,
      color: 'rose',
      decisions: [
        {
          id: '11.1',
          title: 'Internationalization (i18n)',
          description: 'Supporting multiple languages and locales.',
          phase: 4,
          options: [
            { name: 'react-i18next / vue-i18n', pros: ['Framework-integrated', 'Mature'], cons: ['Library-specific'], bestWhen: 'React/Vue apps needing i18n' },
            { name: 'next-intl', pros: ['Next.js integrated', 'Type-safe'], cons: ['Next.js specific'], bestWhen: 'Next.js apps' },
            { name: 'Paraglide (Inlang)', pros: ['Compile-time', 'Type-safe', 'Framework-agnostic'], cons: ['Newer'], bestWhen: 'Want type-safe, compile-time i18n' },
          ],
          questions: ['How many languages?', 'Who will translate?', 'Is type safety important?']
        },
        {
          id: '11.4',
          title: 'Performance Budget',
          description: 'Setting and enforcing performance targets.',
          phase: 4,
          options: [
            { name: 'Core Web Vitals Targets', pros: ['User-centric metrics', 'SEO impact'], cons: ['Can be hard to achieve'], bestWhen: 'All public-facing apps' },
            { name: 'Bundle Size Budgets', pros: ['Catches bundle bloat'], cons: ['Arbitrary limits'], bestWhen: 'Preventing JS bloat' },
            { name: 'Lighthouse CI', pros: ['Automated checking'], cons: ['Synthetic, not real users'], bestWhen: 'CI integration' },
            { name: 'Real User Monitoring', pros: ['Actual user experience'], cons: ['Requires traffic', 'Cost'], bestWhen: 'Understanding real performance' },
          ],
          questions: ['What devices/connections are users on?', 'Is Core Web Vitals important?', 'What metrics matter most?']
        },
        {
          id: '11.5',
          title: 'Analytics',
          description: 'Understanding user behavior and product usage.',
          phase: 4,
          options: [
            { name: 'Google Analytics (GA4)', pros: ['Free', 'Comprehensive', 'Industry standard'], cons: ['Privacy concerns', 'Complex'], bestWhen: 'Most apps, need free solution' },
            { name: 'Plausible / Fathom', pros: ['Privacy-friendly', 'Simple', 'No cookies'], cons: ['Cost', 'Less features'], bestWhen: 'Privacy-conscious, GDPR simplicity' },
            { name: 'PostHog', pros: ['Open-source', 'Product analytics', 'Session replay'], cons: ['Self-host complexity or cost'], bestWhen: 'Product analytics, session replay' },
            { name: 'Mixpanel / Amplitude', pros: ['Event-based', 'Funnels', 'Retention'], cons: ['Cost at scale'], bestWhen: 'Product analytics depth' },
          ],
          questions: ['What questions do you need to answer?', 'Is privacy a concern?', 'Product or web analytics?']
        },
      ]
    },
  ]