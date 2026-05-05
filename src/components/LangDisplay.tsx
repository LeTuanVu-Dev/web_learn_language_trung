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
      {showPin && (
        <p className={`font-ui text-pinyin ${compact ? 'text-sm' : 'text-base'}`}>
          {word.pinyin}
        </p>
      )}

      {showPrimary && (primaryMeanings.length > 0 || primaryFallback.length > 0) && (
        <p className={`font-ui text-gray-200 ${compact ? 'text-sm' : 'text-base'} leading-snug`}>
          {(primaryMeanings.length > 0 ? primaryMeanings : primaryFallback).join('；')}
        </p>
      )}

      {showSec && secondaryMeanings.length > 0 && (
        <p className={`font-ui ${compact ? 'text-xs' : 'text-sm'} text-gray-500`}>
          <span className="text-xs border border-gray-700 rounded px-1 mr-1.5">{secLabel}</span>
          {secondaryMeanings.join(', ')}
        </p>
      )}
    </div>
  )
}
