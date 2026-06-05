import type { ReactNode } from 'react'
import { useSettings } from '../store/settings'
import { Lang, WritingCheckMode } from '../types'

export function Settings() {
  const settings = useSettings()
  const isVi = settings.primaryLanguage === 'vi'

  return (
    <div className="flex flex-col gap-6 py-4">
      <h1 className="text-lg font-semibold text-gray-900">
        {isVi ? 'Cài đặt' : 'Settings'}
      </h1>

      <Section title={isVi ? 'Ngôn ngữ học' : 'Learning Language'}>
        <RadioGroup
          label={isVi ? 'Ngôn ngữ chính' : 'Primary language'}
          value={settings.primaryLanguage}
          onChange={(value) => settings.set('primaryLanguage', value as Lang)}
          options={[
            { value: 'vi', label: isVi ? 'Tiếng Việt' : 'Vietnamese', sub: isVi ? 'Việt → Trung' : 'Vietnamese → Chinese' },
            { value: 'en', label: isVi ? 'Tiếng Anh' : 'English', sub: isVi ? 'Anh → Trung' : 'English → Chinese' },
          ]}
        />
        <Toggle
          label={isVi ? 'Hiện ngôn ngữ phụ' : 'Show secondary language'}
          sub={isVi ? 'Hiện thêm nghĩa tiếng Anh' : 'Show Vietnamese meanings too'}
          value={settings.showSecondaryLanguage}
          onChange={(value) => settings.set('showSecondaryLanguage', value)}
        />
      </Section>

      <Section title="Pinyin">
        <Toggle
          label={isVi ? 'Cho phép pinyin ở gợi ý/đáp án' : 'Allow pinyin in hints/answers'}
          sub={
            isVi
              ? 'Không hiện sẵn trên mặt học chính; chỉ hiện khi gợi ý hoặc sau khi trả lời.'
              : 'Hidden on the main prompt; shown only as a hint or after answering.'
          }
          value={settings.showPinyin}
          onChange={(value) => settings.set('showPinyin', value)}
        />
      </Section>

      <Section title={isVi ? 'Luyện viết' : 'Writing Practice'}>
        <RadioGroup
          label={isVi ? 'Chế độ chấm' : 'Scoring mode'}
          value={settings.writingCheckMode}
          onChange={(value) => settings.set('writingCheckMode', value as WritingCheckMode)}
          options={[
            { value: 'auto', label: isVi ? 'Tự động' : 'Auto', sub: isVi ? 'Ưu tiên chấm theo độ giống hình dạng.' : 'Prefer shape similarity scoring.' },
            { value: 'strict', label: 'Strict', sub: isVi ? 'Gắn nhãn strict để phân biệt kết quả, nhưng vẫn hiện % tương đồng.' : 'Marks strict results while still showing similarity percent.' },
            { value: 'shape', label: 'Shape', sub: isVi ? 'Chấm theo hình dạng tổng thể, bỏ qua khác biệt to nhỏ.' : 'Scores overall shape and ignores small scale differences.' },
          ]}
        />
      </Section>

      <div className="pt-2">
        <button
          onClick={settings.reset}
          className="w-full rounded-xl border border-border py-3 text-sm text-gray-700 transition-colors hover:border-red-400 hover:text-red-700"
        >
          {isVi ? 'Đặt lại về mặc định' : 'Reset to defaults'}
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
