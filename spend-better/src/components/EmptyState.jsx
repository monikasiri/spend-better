export default function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="text-center py-8 px-4 text-ink-500 dark:text-ink-400 text-sm">
      <i className={`ti ${icon} text-3xl opacity-40 block mb-2`}></i>
      <div className="font-medium text-ink-900 dark:text-ink-100">{title}</div>
      <div>{subtitle}</div>
    </div>
  )
}
