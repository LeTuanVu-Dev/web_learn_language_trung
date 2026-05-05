export interface RadicalEntry {
  char: string
  pinyin: string
  meaningVi: string
  meaningEn: string
  strokeCount: number
  examples: string[]
}

export const commonRadicals: RadicalEntry[] = [
  { char: '人', pinyin: 'rén', meaningVi: 'người', meaningEn: 'person', strokeCount: 2, examples: ['他', '你', '们', '做'] },
  { char: '女', pinyin: 'nǚ', meaningVi: 'phụ nữ', meaningEn: 'woman', strokeCount: 3, examples: ['妈', '她', '好', '姐'] },
  { char: '口', pinyin: 'kǒu', meaningVi: 'miệng', meaningEn: 'mouth', strokeCount: 3, examples: ['吃', '喝', '叫', '问'] },
  { char: '手', pinyin: 'shǒu', meaningVi: 'tay', meaningEn: 'hand', strokeCount: 4, examples: ['打', '拿', '找', '推'] },
  { char: '水', pinyin: 'shuǐ', meaningVi: 'nước', meaningEn: 'water', strokeCount: 4, examples: ['海', '河', '汉', '洗'] },
  { char: '火', pinyin: 'huǒ', meaningVi: 'lửa', meaningEn: 'fire', strokeCount: 4, examples: ['热', '烟', '炒', '烧'] },
  { char: '木', pinyin: 'mù', meaningVi: 'gỗ/cây', meaningEn: 'wood/tree', strokeCount: 4, examples: ['桌', '椅', '树', '机'] },
  { char: '日', pinyin: 'rì', meaningVi: 'mặt trời/ngày', meaningEn: 'sun/day', strokeCount: 4, examples: ['明', '时', '星', '晒'] },
  { char: '月', pinyin: 'yuè', meaningVi: 'mặt trăng/tháng', meaningEn: 'moon/month', strokeCount: 4, examples: ['明', '期', '朋', '服'] },
  { char: '土', pinyin: 'tǔ', meaningVi: 'đất', meaningEn: 'earth/soil', strokeCount: 3, examples: ['在', '地', '坐', '城'] },
  { char: '心', pinyin: 'xīn', meaningVi: 'tim/tâm', meaningEn: 'heart/mind', strokeCount: 4, examples: ['想', '爱', '忘', '感'] },
  { char: '目', pinyin: 'mù', meaningVi: 'mắt', meaningEn: 'eye', strokeCount: 5, examples: ['看', '眼', '睡', '视'] },
  { char: '金', pinyin: 'jīn', meaningVi: 'kim loại/vàng', meaningEn: 'metal/gold', strokeCount: 8, examples: ['钱', '铁', '银', '钟'] },
  { char: '言', pinyin: 'yán', meaningVi: 'lời nói', meaningEn: 'speech/words', strokeCount: 7, examples: ['说', '语', '话', '读'] },
  { char: '山', pinyin: 'shān', meaningVi: 'núi', meaningEn: 'mountain', strokeCount: 3, examples: ['岁', '岛', '峰', '崖'] },
  { char: '大', pinyin: 'dà', meaningVi: 'lớn', meaningEn: 'big', strokeCount: 3, examples: ['太', '天', '夫', '头'] },
  { char: '子', pinyin: 'zǐ', meaningVi: 'con/đứa trẻ', meaningEn: 'child/son', strokeCount: 3, examples: ['字', '学', '孩', '孙'] },
  { char: '草', pinyin: 'cǎo', meaningVi: 'cỏ/thực vật', meaningEn: 'grass/plant', strokeCount: 3, examples: ['菜', '茶', '花', '草'] },
  { char: '虫', pinyin: 'chóng', meaningVi: 'sâu bọ/côn trùng', meaningEn: 'insect/worm', strokeCount: 6, examples: ['蛇', '蜂', '蝶', '蛙'] },
  { char: '马', pinyin: 'mǎ', meaningVi: 'ngựa', meaningEn: 'horse', strokeCount: 3, examples: ['妈', '吗', '骑', '骂'] },
]
