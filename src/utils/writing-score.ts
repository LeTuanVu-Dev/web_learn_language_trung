import { WritingScoreResult } from '../types'

export interface Point {
  x: number
  y: number
}

type Stroke = Point[]

function flatten(strokes: Stroke[]) {
  return strokes.flat()
}

function getBounds(points: Point[]) {
  const xs = points.map((point) => point.x)
  const ys = points.map((point) => point.y)
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  }
}

function normalizeStrokes(strokes: Stroke[]): Stroke[] {
  const points = flatten(strokes)
  if (points.length === 0) return []

  const bounds = getBounds(points)
  const width = Math.max(bounds.maxX - bounds.minX, 1)
  const height = Math.max(bounds.maxY - bounds.minY, 1)
  const size = Math.max(width, height)
  const offsetX = bounds.minX + width / 2
  const offsetY = bounds.minY + height / 2

  return strokes.map((stroke) =>
    stroke.map((point) => ({
      x: (point.x - offsetX) / size,
      y: (point.y - offsetY) / size,
    })),
  )
}

function linePoints(from: Point, to: Point) {
  const steps = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y)) * 48
  const count = Math.max(2, Math.ceil(steps))
  return Array.from({ length: count }, (_, index) => {
    const t = index / (count - 1)
    return {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
    }
  })
}

function rasterize(strokes: Stroke[], gridSize = 36) {
  const grid = new Set<string>()
  const normalized = normalizeStrokes(strokes)

  for (const stroke of normalized) {
    for (let index = 0; index < stroke.length; index += 1) {
      const current = stroke[index]
      const next = stroke[index + 1]
      const segment = next ? linePoints(current, next) : [current]

      for (const point of segment) {
        const gx = Math.round((point.x + 0.5) * (gridSize - 1))
        const gy = Math.round((point.y + 0.5) * (gridSize - 1))

        for (let dx = -1; dx <= 1; dx += 1) {
          for (let dy = -1; dy <= 1; dy += 1) {
            const px = gx + dx
            const py = gy + dy
            if (px >= 0 && px < gridSize && py >= 0 && py < gridSize) {
              grid.add(`${px},${py}`)
            }
          }
        }
      }
    }
  }

  return grid
}

export function scoreWritingSimilarity(
  referenceStrokes: Stroke[],
  drawnStrokes: Stroke[],
): WritingScoreResult {
  const referencePoints = flatten(referenceStrokes).length
  const drawnPoints = flatten(drawnStrokes).length

  if (referencePoints === 0 || drawnPoints === 0) {
    return {
      similarityPct: 0,
      status: 'needs-practice',
      rawMetrics: {
        referencePoints,
        drawnPoints,
        overlapPct: 0,
      },
      fallbackMode: 'shape',
    }
  }

  const referenceGrid = rasterize(referenceStrokes)
  const drawnGrid = rasterize(drawnStrokes)
  const intersection = Array.from(drawnGrid).filter((pixel) => referenceGrid.has(pixel)).length
  const overlapPct = Math.round((2 * intersection / Math.max(referenceGrid.size + drawnGrid.size, 1)) * 100)
  const similarityPct = Math.max(0, Math.min(100, overlapPct))

  return {
    similarityPct,
    status: similarityPct >= 85 ? 'excellent' : similarityPct >= 65 ? 'good' : 'needs-practice',
    rawMetrics: {
      referencePoints,
      drawnPoints,
      overlapPct,
    },
    fallbackMode: 'shape',
  }
}
