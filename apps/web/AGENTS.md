# Web App (@sd/web) - Golden Paths

This file contains step-by-step recipes for common tasks in the React frontend.

---

## Add a New Component

1. **Create the component file** in `src/components/<ComponentName>.tsx`:

   ```typescript
   import { SomeIcon } from 'lucide-react'
   import clsx from 'clsx'

   interface ComponentNameProps {
     title: string
     variant?: 'default' | 'highlighted'
   }

   export function ComponentName({ title, variant = 'default' }: ComponentNameProps) {
     return (
       <div className={clsx(
         'px-4 py-3 rounded-xl border',
         variant === 'highlighted'
           ? 'bg-cyan-500/10 border-cyan-500/30'
           : 'bg-[#1a2332] border-[#2a3a4a]'
       )}>
         <SomeIcon className="w-5 h-5 text-[#8b9eb3]" />
         <span className="text-[#e4e8ed]">{title}</span>
       </div>
     )
   }
   ```

2. **Import and use** in parent component.

---

## Add a New Modal

1. **Create modal component** in `src/components/<ModalName>.tsx` using `createPortal`:

   ```typescript
   import { createPortal } from 'react-dom'
   import { X } from 'lucide-react'

   interface MyModalProps {
     isOpen: boolean
     onClose: () => void
   }

   export function MyModal({ isOpen, onClose }: MyModalProps) {
     if (!isOpen) return null

     return createPortal(
       <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
         <div className="relative w-full max-w-lg bg-[#0c1018] rounded-2xl border border-[#1e2a3a] overflow-hidden shadow-2xl">
           {/* Header */}
           <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a3a] bg-[#0f1419]">
             <h2 className="text-[15px] font-semibold text-[#e4e8ed]">Modal Title</h2>
             <button onClick={onClose} className="p-2 rounded-lg text-[#6b7c93] hover:text-[#e4e8ed] hover:bg-[#1a2332]">
               <X className="w-5 h-5" />
             </button>
           </div>
           {/* Content */}
           <div className="p-6">
             {/* Modal content here */}
           </div>
         </div>
       </div>,
       document.body
     )
   }
   ```

2. **Manage open state** in parent:

   ```typescript
   const [isModalOpen, setIsModalOpen] = useState(false)
   // ...
   <MyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
   ```

---

## Add a New Custom Hook

1. **Create hook file** in `src/hooks/use<HookName>.ts`:

   ```typescript
   import { useState, useCallback } from 'react'
   import { trpc } from '../trpc'

   interface UseMyFeatureOptions {
     onError?: (error: string) => void
   }

   export function useMyFeature({ onError }: UseMyFeatureOptions = {}) {
     const [state, setState] = useState<string>('')

     const mutation = trpc.myProcedure.useMutation({
       onError: (err) => onError?.(err.message),
     })

     const doSomething = useCallback((value: string) => {
       mutation.mutate({ value })
     }, [mutation])

     return {
       state,
       isLoading: mutation.isPending,
       doSomething,
     }
   }
   ```

2. **Use in component**:

   ```typescript
   const { state, isLoading, doSomething } = useMyFeature({
     onError: (msg) => setError(msg),
   })
   ```

---

## Use a Query with Cache Invalidation

1. **Create the query hook usage** in your component:

   ```typescript
   const utils = trpc.useUtils();
   const { data, isLoading, error } = trpc.getProjects.useQuery();
   ```

2. **Create mutation with cache invalidation**:

   ```typescript
   const createProject = trpc.createProject.useMutation({
     onSuccess: () => {
       // Invalidate and refetch
       utils.getProjects.invalidate();
     },
   });
   ```

3. **Optimistic updates** (optional):

   ```typescript
   const createProject = trpc.createProject.useMutation({
     onMutate: async (newProject) => {
       await utils.getProjects.cancel();
       const previous = utils.getProjects.getData();
       utils.getProjects.setData(undefined, (old) => [...(old ?? []), { ...newProject, id: -1 }]);
       return { previous };
     },
     onError: (err, newProject, context) => {
       utils.getProjects.setData(undefined, context?.previous);
     },
     onSettled: () => {
       utils.getProjects.invalidate();
     },
   });
   ```

---

## Consume a Streaming tRPC Mutation

For AI chat or any streaming response from the API:

```typescript
const mutation = trpc.chat.useMutation()

async function handleStream(prompt: string) {
  const stream = await mutation.mutateAsync({ messages, decision })
  for await (const chunk of stream) {
    if (chunk.type === 'text_delta') {
      // Append chunk.content to your state
      setContent(prev => prev + chunk.content)
    }
  }
}
```

See `src/hooks/useChat.ts` for the full RAF-batched streaming implementation.

