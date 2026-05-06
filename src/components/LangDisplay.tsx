import { WordEntry, Lang } from '../types'
import { useSettings } from '../store/settings'

interface Props {
  word: WordEntry
  showPrimary?: boolean
  showSecondary?: boolean
  showPinyin?: boolean
  primaryOverride?: Lang
  compact?: boolean
}

export function LangDisplay({
  word,
  showPrimary = true,
  showSecondary,
  showPinyin,
  primaryOverride,
  compact = false,
}: Props) {
  const settings = useSettings()
  const lang = primaryOverride ?? settings.primaryLanguage
  const showSec = showSecondary ?? settings.showSecondaryLanguage
  const showPin = showPinyin ?? settings.showPinyin

  const primaryMeanings = lang === 'vi' ? word.meaningsVi : word.meaningsEn
  const secondaryMeanings = lang === 'vi' ? word.meaningsEn : word.meaningsVi
  const primaryFallback = lang === 'vi' ? word.meaningsEn : word.meaningsVi
  const secLabel = lang === 'vi' ? 'EN' : 'VI'

  return (
    <div className={compact ? 'space-y-0.5' : 'space-y-1.5'}>
      {showPin && word.pinyin && (
        <p className={`font-ui text-pinyin ${compact ? 'text-sm' : 'text-base'}`}>
          {word.pinyin}
        </p>
      )}

      {showPrimary && (primaryMeanings.length > 0 || primaryFallback.length > 0) && (
        <p className={`font-ui leading-snug text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
          {(primaryMeanings.length > 0 ? primaryMeanings : primaryFallback).join('；')}
        </p>
      )}

      {showSec && secondaryMeanings.length > 0 && (
        <p className={`font-ui text-gray-700 ${compact ? 'text-xs' : 'text-sm'}`}>
          <span className="mr-1.5 rounded border border-gray-300 px-1 text-xs">{secLabel}</span>
          {secondaryMeanings.join(', ')}
        </p>
      )}
    </div>
  )
}
