import type { ReactNode } from 'react'
import { useSettings } from '../store/settings'
import { Lang, WritingCheckMode } from '../types'

export function Settings() {
  const settings = useSettings()

  return (
    <div className="py-4 flex flex-col gap-6">
      <h1 className="text-lg font-semibold text-gray-200">Cài đặt</h1>

      <Section title="Ngôn ngữ học">
        <RadioGroup
          label="Ngôn ngữ chính"
          value={settings.primaryLanguage}
          onChange={(value) => settings.set('primaryLanguage', value as Lang)}
          options={[
            { value: 'vi', label: 'Tiếng Việt', sub: 'Trung → Việt' },
            { value: 'en', label: 'English', sub: 'Chinese → English' },
          ]}
        />
        <Toggle
          label="Hiện ngôn ngữ phụ"
          sub={settings.primaryLanguage === 'vi' ? 'Hiện thêm nghĩa tiếng Anh' : 'Hiện thêm nghĩa tiếng Việt'}
          value={settings.showSecondaryLanguage}
          onChange={(value) => settings.set('showSecondaryLanguage', value)}
        />
      </Section>

      <Section title="Hiển thị">
        <Toggle
          label="Hiện Pinyin"
          sub="Hiện phiên âm dưới chữ Hán"
          value={settings.showPinyin}
          onChange={(value) => settings.set('showPinyin', value)}
        />
      </Section>

      <Section title="Luyện viết">
        <RadioGroup
          label="Chế độ chấm"
          value={settings.writingCheckMode}
          onChange={(value) => settings.set('writingCheckMode', value as WritingCheckMode)}
          options={[
            { value: 'auto', label: 'Tự động', sub: 'Strict nếu có dữ liệu, ngược lại dùng shape' },
            { value: 'strict', label: 'Strict', sub: 'Kiểm tra số nét, thứ tự và hướng nét' },
            { value: 'shape', label: 'Shape', sub: 'Chấm dựa vào hình dạng tổng thể' },
          ]}
        />
      </Section>

      <div className="pt-2">
        <button
          onClick={settings.reset}
          className="w-full py-3 rounded-xl border border-border text-gray-500 text-sm hover:border-red-700 hover:text-red-400 transition-colors"
        >
          Đặt lại về mặc định
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</h2>
      <div className="rounded-2xl border border-border bg-surface-2 divide-y divide-border overflow-hidden">
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
    <div className="flex items-center justify-between p-4 gap-4">
      <div>
        <p className="text-sm text-gray-200">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
          value ? 'bg-pinyin' : 'bg-gray-700'
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
    <div className="p-4 flex flex-col gap-2">
      <p className="text-sm text-gray-200 mb-1">{label}</p>
      {options.map((option) => (
        <label key={option.value} className="flex items-start gap-3 cursor-pointer">
          <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 transition-colors ${
            value === option.value ? 'border-pinyin bg-pinyin' : 'border-gray-600'
          }`}>
            {value === option.value && (
              <span className="flex items-center justify-center h-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white block" />
              </span>
            )}
          </div>
          <div onClick={() => onChange(option.value)}>
            <p className="text-sm text-gray-200">{option.label}</p>
            {option.sub && <p className="text-xs text-gray-500">{option.sub}</p>}
          </div>
        </label>
      ))}
    </div>
  )
}
