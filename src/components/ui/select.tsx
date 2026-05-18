import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

function Select({ value, onValueChange, children, className }: SelectProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className={cn("relative w-full", className)}>{children}</div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<any, React.ComponentPropsWithoutRef<typeof Slot> & { asChild?: boolean }>(
  ({ asChild = false, children, onClick, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      type={asChild ? undefined : "button"}
      ref={ref}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) {
          context?.setOpen(!context.open)
        }
      }}
      {...props}
    >
      {children}
    </Comp>
  )
})
SelectTrigger.displayName = "SelectTrigger"

function SelectValue({ placeholder }: { placeholder?: string }) {
  const context = React.useContext(SelectContext)
  return <span>{context?.value || placeholder || ""}</span>
}

function SelectContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(SelectContext)
  if (!context?.open) return null

  return (
    <div
      className={cn(
        "absolute z-40 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface SelectItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

const SelectItem = React.forwardRef<HTMLButtonElement, SelectItemProps>(
  ({ value, children, className, onClick, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    const selected = context?.value === value

    return (
      <button
        type="button"
        ref={ref}
        className={cn(
          "w-full px-3 py-2 text-left text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500",
          selected && "bg-slate-100",
          className
        )}
        onClick={(event) => {
          onClick?.(event)
          context?.onValueChange(value)
          context?.setOpen(false)
        }}
        {...props}
      >
        {children}
      </button>
    )
  }
)
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
