import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

interface TabsProps {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}

function Tabs({ defaultValue, value, onValueChange, className, children }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const currentValue = value ?? internalValue

  const handleValueChange = React.useCallback(
    (nextValue: string) => {
      setInternalValue(nextValue)
      onValueChange?.(nextValue)
    },
    [onValueChange]
  )

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  )
}

function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("inline-flex rounded-xl bg-slate-100 p-1", className)} {...props} />
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, className, children, onClick, ...props }, ref) => {
    const context = React.useContext(TabsContext)
    const active = context?.value === value

    return (
      <button
        ref={ref}
        type="button"
        data-state={active ? "active" : "inactive"}
        className={cn(
          "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
          active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900",
          className
        )}
        onClick={(event) => {
          onClick?.(event)
          context?.onValueChange(value)
        }}
        {...props}
      >
        {children}
      </button>
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const context = React.useContext(TabsContext)
  if (context?.value !== value) return null
  return (
    <div className={cn("w-full", className)} {...props}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
