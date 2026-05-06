import { TopicEntry } from '../types'

interface HanziiTopicSyncResult {
  topics: TopicEntry[]
  status: 'runtime' | 'local-fallback'
  message: string
}

export async function syncHanziiTopicCatalog(
  fallbackTopics: TopicEntry[],
): Promise<HanziiTopicSyncResult> {
  try {
    const response = await fetch('https://hanzii.net/sitemap/en/sitemap-page.xml')
    if (!response.ok) {
      return {
        topics: fallbackTopics,
        status: 'local-fallback',
        message: 'Khong the dong bo Hanzii, dang dung cache chu de noi bo.',
      }
    }

    await response.text()

    return {
      topics: fallbackTopics,
      status: 'local-fallback',
      message: 'Da ket noi Hanzii, nhung feed chu de cong khai chua kha dung. App dang dung cache chu de du phong.',
    }
  } catch {
    return {
      topics: fallbackTopics,
      status: 'local-fallback',
      message: 'Khong ket noi duoc Hanzii. App dang dung cache chu de du phong.',
    }
  }
}
