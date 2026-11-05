// The name a clip's file carries: the one given, else its section's from-to. A clip name holds no period, so a fractional
// Second is written with an underscore
export const getClipName = (name: string, from: string, to: string): string =>
  name || `${from}-${to}`.replaceAll(".", "_");
