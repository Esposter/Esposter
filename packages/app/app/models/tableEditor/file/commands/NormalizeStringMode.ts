export enum NormalizeStringMode {
  Lowercase = "lowercase",
  TitleCase = "Title Case",
  Trim = "Trim",
  Uppercase = "UPPERCASE",
}

export const NormalizeStringModes: ReadonlySet<NormalizeStringMode> = new Set(Object.values(NormalizeStringMode));
