export function splitTotal(splits = []) {
  return splits.reduce((sum, split) => sum + (Number(split.amount) || 0), 0)
}

export function resizeSplits(splits = [], nextTotal) {
  const cleanTotal = Math.round((Number(nextTotal) || 0) * 100) / 100
  const currentTotal = splitTotal(splits)

  if (!splits.length) return []
  if (!currentTotal) return splits.map(split => ({ ...split, amount: 0 }))

  const scaled = splits.map(split => ({
    ...split,
    amount: Math.round(((Number(split.amount) || 0) / currentTotal) * cleanTotal * 100) / 100,
  }))

  const drift = Math.round((cleanTotal - splitTotal(scaled)) * 100) / 100
  scaled[0] = { ...scaled[0], amount: Math.round((scaled[0].amount + drift) * 100) / 100 }
  return scaled
}
