export const describeNames = (label: string, names: readonly string[]) =>
  names.length > 0 ? `\n${names.length} ${label}: ${names.join(", ")}` : "";
