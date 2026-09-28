const BrowserNames: readonly (readonly [RegExp, string])[] = [
  [/Edg\//u, "Edge"],
  [/Firefox\//u, "Firefox"],
  [/Chrome\//u, "Chrome"],
  [/Safari\//u, "Safari"],
];
const SystemNames: readonly (readonly [RegExp, string])[] = [
  [/Windows/u, "Windows"],
  [/Android/u, "Android"],
  [/iPhone|iPad/u, "iOS"],
  [/Mac OS X/u, "macOS"],
  [/Linux/u, "Linux"],
];

// A name a person recognises a device by, from its user agent: the first browser and system it names, in the order a
// User agent that names several — Edge's names Chrome and Safari too — means the first
export const getDeviceName = (userAgent: string): string => {
  const browserName = BrowserNames.find(([pattern]) => pattern.test(userAgent))?.[1] ?? "A browser";
  const systemName = SystemNames.find(([pattern]) => pattern.test(userAgent))?.[1];
  return systemName ? `${browserName} on ${systemName}` : browserName;
};
