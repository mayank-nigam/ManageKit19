// Compact number formatter for grid balance chips (SMS / Mail / Wallet).
//
// The legacy page's funcConvertNumberToReadable had a threshold/divisor mismatch:
// values >= 100,000 were divided by 1,000,000 (the "M" divisor), which produced
// misleading results like 150,000 -> "0.2M" instead of the expected "150.0K".
// This implementation pairs each threshold with the matching divisor.
export function formatCompactNumber(value) {
  const num = Number(value) || 0;
  const abs = Math.abs(num);

  if (abs >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return `${num}`;
}
