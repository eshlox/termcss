// OKLCH → WCAG relative luminance via OKLab → linear sRGB pipeline

export function oklchToLuminance(L, C, H) {
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  // OKLab → LMS (cube roots)
  const l = L + 0.3963377774 * a + 0.2158037573 * b;
  const m = L - 0.1055613458 * a - 0.0638541728 * b;
  const s = L - 0.0894841775 * a - 1.2914855480 * b;

  // Cube to get linear LMS, then LMS → linear sRGB
  const l3 = l * l * l;
  const m3 = m * m * m;
  const s3 = s * s * s;
  const R = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const G = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const B = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

  return 0.2126729 * R + 0.7151522 * G + 0.0721750 * B;
}

export function contrastRatio(Y1, Y2) {
  const lighter = Math.max(Y1, Y2);
  const darker = Math.min(Y1, Y2);
  return (lighter + 0.05) / (darker + 0.05);
}
