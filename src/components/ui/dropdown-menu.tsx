import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

interface DropdownMenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | undefined>(undefined)

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className="relative inline-block">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

const DropdownMenuTrigger = React.forwardRef<any, React.ComponentPropsWithoutRef<typeof Slot> & { asChild?: boolean }>(
  ({ asChild = false, children, onClick, ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext)
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
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

function DropdownMenuContent({ className, children, align = "end", ...props }: React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "end" }) {
  const context = React.useContext(DropdownMenuContext)
  if (!context?.open) return null

  return (
    <div
      className={cn(
        "absolute z-50 mt-2 min-w-max overflow-visible rounded-xl border border-slate-200 bg-white shadow-xl",
        align === "start" ? "left-0" : "right-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const DropdownMenuItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    type="button"
    ref={ref}
    className={cn(
      "w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500",
      className
    )}
    {...props}
  >
    {children}
  </button>
))
DropdownMenuItem.displayName = "DropdownMenuItem"

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem }
