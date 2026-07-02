// Maps a Node tty color depth (bits-per-pixel from WriteStream.getColorDepth) to the FORCE_COLOR level string the
// Supports-color convention uses — "1" = 16 colors, "2" = 256, "3" = truecolor — so a child whose color is forced on
// Matches the host terminal's fidelity instead of falling back to 16 colors. The numeric levels are that external
// Standard's own API (like NO_COLOR / FORCE_COLOR="0"), not one of virrun's own true/false env flags.
export const getForceColorLevel = (colorDepth: number): string => {
  if (colorDepth >= 24) return "3";
  else if (colorDepth >= 8) return "2";
  else return "1";
};
