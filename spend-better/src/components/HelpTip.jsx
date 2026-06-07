import { useState, useRef, useEffect } from 'react'

export default function HelpTip({ children, placement = 'top' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onClick = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <span ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 transition"
        aria-label="Help"
      >
        <i className="ti ti-help-circle text-xs"></i>
      </button>
      {open && (
        <span
          className={`absolute z-30 w-56 p-2.5 text-xs leading-relaxed bg-ink-900 dark:bg-ink-100 text-white dark:text-ink-900 rounded-md shadow-lg ${
            placement === 'top'
              ? 'bottom-full left-1/2 -translate-x-1/2 mb-1.5'
              : 'top-full left-1/2 -translate-x-1/2 mt-1.5'
          }`}
        >
          {children}
        </span>
      )}
    </span>
  )
}
