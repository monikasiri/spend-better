import { useState, useEffect, useLayoutEffect, useRef } from 'react'

const STEPS = [
  {
    target: '[data-tour="header"]',
    title: 'Navigate by month',
    body: 'Use the arrows to switch months. Today brings you back to this month. The icons next to it import or export your data and toggle dark mode.',
  },
  {
    target: '[data-tour="tabs"]',
    title: 'Six tabs, one job each',
    body: 'Dashboard for the overview. Accounts for balances. Transactions to log spending. Budgets, Goals, and Recurring for planning. Press 1-6 anytime to jump.',
  },
  {
    target: '[data-tour="dashboard-stats"]',
    title: 'Auto-generated insights',
    body: 'Stats and insights update as you add transactions. The dashboard flags your biggest expense, spending jumps, reimbursable totals, and budget warnings.',
    tab: 'dashboard',
  },
  {
    target: '[data-tour="add-tx"]',
    title: 'Add a transaction',
    body: 'Pick type, account, category, date, amount. Optional: add tags like "vacation" or "reimbursable". Need to split across categories? Use the Split button.',
    tab: 'transactions',
  },
  {
    target: '[data-tour="reset"]',
    title: "That's it",
    body: 'Reset everything anytime from the footer. Replay this tour from there too. All data lives in your browser - no signups, no servers.',
  },
]

const POPOVER_W = 320
const POPOVER_GAP = 14

export default function Tour({ onClose, setActiveTab }) {
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState(null)
  const [popoverHeight, setPopoverHeight] = useState(180)
  const popoverRef = useRef(null)
  const current = STEPS[step]

  // Switch tabs when steps change tabs
  useEffect(() => {
    if (current.tab) setActiveTab(current.tab)
  }, [step])

  // Measure target element + scroll into view
  useEffect(() => {
    const measure = () => {
      const el = document.querySelector(current.target)
      if (!el) { setRect(null); return }
      const r = el.getBoundingClientRect()
      setRect({
        top: r.top, left: r.left, width: r.width, height: r.height,
        bottom: r.bottom, right: r.right,
      })
    }
    // First, scroll the element into view, then measure after settling
    const el = document.querySelector(current.target)
    if (el) {
      // Scroll so element is visible with margin for popover
      const r = el.getBoundingClientRect()
      const desiredTop = window.innerHeight * 0.25
      const scrollDelta = r.top - desiredTop
      if (Math.abs(scrollDelta) > 50) {
        window.scrollBy({ top: scrollDelta, behavior: 'smooth' })
      }
    }
    const t = setTimeout(measure, 350)
    const t2 = setTimeout(measure, 700)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      clearTimeout(t); clearTimeout(t2)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [step])

  // Measure popover height for accurate placement
  useLayoutEffect(() => {
    if (popoverRef.current) {
      setPopoverHeight(popoverRef.current.offsetHeight)
    }
  }, [step, rect])

  const next = () => step < STEPS.length - 1 ? setStep(step + 1) : onClose()
  const prev = () => step > 0 && setStep(step - 1)

  // Compute popover position with smart auto-flip and clamping
  const computePosition = () => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    if (!rect) {
      // Center if no target
      return {
        top: Math.max(20, (vh - popoverHeight) / 2),
        left: Math.max(16, (vw - POPOVER_W) / 2),
      }
    }
    const spaceBelow = vh - rect.bottom
    const spaceAbove = rect.top
    let top, placement

    if (spaceBelow >= popoverHeight + POPOVER_GAP + 20) {
      top = rect.bottom + POPOVER_GAP
      placement = 'bottom'
    } else if (spaceAbove >= popoverHeight + POPOVER_GAP + 20) {
      top = rect.top - popoverHeight - POPOVER_GAP
      placement = 'top'
    } else {
      if (spaceBelow > spaceAbove) {
        top = Math.max(8, vh - popoverHeight - 8)
        placement = 'bottom-clamped'
      } else {
        top = 8
        placement = 'top-clamped'
      }
    }

    // Horizontal: try to center on target, then clamp
    let left = rect.left + rect.width / 2 - POPOVER_W / 2
    left = Math.max(16, Math.min(left, vw - POPOVER_W - 16))

    return { top, left, placement }
  }

  const pos = computePosition()
  const SVG_PAD = 6

  return (
    <>
      {/* Dim overlay with hole around target */}
      <div className="fixed inset-0 z-40 pointer-events-auto" onClick={onClose}>
        {rect ? (
          <svg width="100%" height="100%" className="absolute inset-0 block">
            <defs>
              <mask id="tour-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                <rect
                  x={rect.left - SVG_PAD}
                  y={rect.top - SVG_PAD}
                  width={rect.width + SVG_PAD * 2}
                  height={rect.height + SVG_PAD * 2}
                  rx="10"
                  fill="black"
                />
              </mask>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#tour-mask)" />
            <rect
              x={rect.left - SVG_PAD}
              y={rect.top - SVG_PAD}
              width={rect.width + SVG_PAD * 2}
              height={rect.height + SVG_PAD * 2}
              rx="10"
              fill="none"
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="2"
            />
          </svg>
        ) : (
          <div className="absolute inset-0 bg-black/60"></div>
        )}
      </div>

      {/* Popover */}
      <div
        ref={popoverRef}
        onClick={e => e.stopPropagation()}
        className="fixed z-50 bg-white dark:bg-ink-900 rounded-xl shadow-2xl border border-ink-200 dark:border-ink-800 overflow-hidden"
        style={{
          top: pos.top,
          left: pos.left,
          width: POPOVER_W,
          maxHeight: 'calc(100vh - 16px)',
        }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              Step {step + 1} of {STEPS.length}
            </span>
            <button
              onClick={onClose}
              className="text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 p-1 -mr-1"
              aria-label="Close tour"
            >
              <i className="ti ti-x text-base"></i>
            </button>
          </div>
          <h3 className="text-base font-semibold mb-1.5 leading-tight">{current.title}</h3>
          <p className="text-[13px] text-ink-600 dark:text-ink-300 leading-relaxed">{current.body}</p>
        </div>
        <div className="border-t border-ink-200 dark:border-ink-800 px-3.5 py-2.5 flex items-center justify-between bg-ink-50 dark:bg-ink-950/50">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-6 bg-ink-900 dark:bg-ink-100' : 'w-1.5 bg-ink-300 dark:bg-ink-700'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2 items-center">
            {step > 0 && (
              <button onClick={prev} className="text-xs text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 px-2 py-1">
                Back
              </button>
            )}
            <button
              onClick={next}
              className="text-xs px-3 py-1.5 rounded-md bg-ink-900 dark:bg-ink-100 text-white dark:text-ink-900 font-medium hover:bg-ink-800 dark:hover:bg-ink-200"
            >
              {step === STEPS.length - 1 ? "Got it" : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
