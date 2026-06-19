export const getSection = (name: string, text: string): string =>
  new RegExp(`^${name}:\\n(?<section>[\\s\\S]*?)(?=^\\S|(?![\\s\\S]))`, "mu").exec(text)?.groups?.section ?? "";
