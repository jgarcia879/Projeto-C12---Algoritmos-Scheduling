import type { LucideIcon } from 'lucide-react'

interface Props { label: string; value: string; detail: string; icon: LucideIcon; accent: 'red' | 'gold' | 'green' }
const accents = {
  red: { icon: 'text-[#c62828]', bar: 'bg-[#c62828]' },
  gold: { icon: 'text-[#d9a441]', bar: 'bg-[#d9a441]' },
  green: { icon: 'text-[#6f8f72]', bar: 'bg-[#6f8f72]' },
}

export function MetricCard({ label, value, detail, icon: Icon, accent }: Props) {
  return <article className="panel relative min-h-40 overflow-hidden p-5"><span className={`absolute inset-x-0 top-0 h-0.5 ${accents[accent].bar}`} /><div className="flex items-start justify-between gap-4"><span className="eyebrow text-[#b9adad]">{label}</span><Icon className={accents[accent].icon} size={18} strokeWidth={1.8} /></div><div className="mt-5 text-3xl font-black tracking-[-0.04em] text-[#f5f0e8]">{value}</div><p className="mt-2 text-xs text-[#b9adad]">{detail}</p></article>
}