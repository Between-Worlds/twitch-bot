export function hexToABGRNumeric(hex: string) {
  // Remove the hash at the start if it's there
  hex = hex.replace(/^#/, '');

  // Parse the r, g, b values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Assume full opacity for the alpha value (255)
  const a = 255;

  // Combine into a single ABGR numeric value
  const abgr = (a << 24) | (b << 16) | (g << 8) | r;

  // Return the numeric value
  return abgr >>> 0; // >>> 0 is used to ensure it's treated as an unsigned 32-bit integer
}
