export function formatScoreNumber(value: number | null | undefined) {
  const numberValue = Number(value ?? 0);
  if (!Number.isFinite(numberValue)) return "0";
  const rounded = Math.round(numberValue * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function formatScorePair(score: number | null | undefined, maxScore: number | null | undefined) {
  return `${formatScoreNumber(score)}/${formatScoreNumber(maxScore)}`;
}
