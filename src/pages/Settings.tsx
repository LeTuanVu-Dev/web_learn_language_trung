import type { ReactNode } from 'react'
import { useSettings } from '../store/settings'
import { Lang, WritingCheckMode } from '../types'

export function Settings() {
  const settings = useSettings()

  return (
    <div className="flex flex-col gap-6 py-4">
      <h1 className="text-lg font-semibold text-gray-900">Cai dat</h1>

      <Section title="Ngon ngu hoc">
        <RadioGroup
          label="Ngon ngu chinh"
          value={settings.primaryLanguage}
          onChange={(value) => settings.set('primaryLanguage', value as Lang)}
          options={[
            { value: 'vi', label: 'Tieng Viet', sub: 'Trung → Viet' },
            { value: 'en', label: 'English', sub: 'Chinese → English' },
          ]}
        />
        <Toggle
          label="Hien ngon ngu phu"
          sub={settings.primaryLanguage === 'vi' ? 'Hien them nghia tieng Anh' : 'Hien them nghia tieng Viet'}
          value={settings.showSecondaryLanguage}
          onChange={(value) => settings.set('showSecondaryLanguage', value)}
        />
      </Section>

      <Section title="Pinyin">
        <Toggle
          label="Cho phep pinyin o hint/dap an"
          sub="Khong hien san tren mat hoc chinh; chi hien khi goi y hoac sau khi tra loi."
          value={settings.showPinyin}
          onChange={(value) => settings.set('showPinyin', value)}
        />
      </Section>

      <Section title="Luyen viet">
        <RadioGroup
          label="Che do cham"
          value={settings.writingCheckMode}
          onChange={(value) => settings.set('writingCheckMode', value as WritingCheckMode)}
          options={[
            { value: 'auto', label: 'Tu dong', sub: 'Uu tien cham theo do giong hinh dang.' },
            { value: 'strict', label: 'Strict', sub: 'Gan nhan strict de phan biet ket qua, nhung van hien % tuong dong.' },
            { value: 'shape', label: 'Shape', sub: 'Cham theo hinh dang tong the, bo qua khac biet to nho.' },
          ]}
        />
      </Section>

      <div className="pt-2">
        <button
          onClick={settings.reset}
          className="w-full rounded-xl border border-border py-3 text-sm text-gray-700 transition-colors hover:border-red-400 hover:text-red-700"
        >
          Dat lai ve mac dinh
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xs font-medium uppercase tracking-wider text-gray-600">{title}</h2>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-2 divide-y divide-border">
        {children}
      </div>
    </div>
  )
}

function Toggle({
  label,
  sub,
  value,
  onChange,
}: {
  label: string
  sub: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div>
        <p className="text-sm text-gray-900">{label}</p>
        <p className="mt-0.5 text-xs text-gray-600">{sub}</p>
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
          value ? 'bg-pinyin' : 'bg-gray-400'
        }`}
      >
        <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
          value ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    </div>
  )
}

function RadioGroup<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string; sub?: string }[]
}) {
  return (
    <div className="flex flex-col gap-2 p-4">
      <p className="mb-1 text-sm text-gray-900">{label}</p>
      {options.map((option) => (
        <label key={option.value} className="flex cursor-pointer items-start gap-3">
          <button
            type="button"
            onClick={() => onChange(option.value)}
            className={`mt-0.5 h-4 w-4 flex-shrink-0 rounded-full border-2 transition-colors ${
              value === option.value ? 'border-pinyin bg-pinyin' : 'border-gray-400'
            }`}
          >
            {value === option.value && (
              <span className="flex h-full items-center justify-center">
                <span className="block h-1.5 w-1.5 rounded-full bg-white" />
              </span>
            )}
          </button>
          <div>
            <p className="text-sm text-gray-900">{option.label}</p>
            {option.sub && <p className="text-xs text-gray-600">{option.sub}</p>}
          </div>
        </label>
      ))}
    </div>
  )
}
