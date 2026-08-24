// Markers are ordered, because a user agent is a pile of compatibility claims rather than a statement: every
// Chromium browser still says `Chrome`, and every one of those still says `Safari`. So the most specific claim
// Is the one a reader means, and it has to be read first
const BrowserMarkerItems: { marker: string; name: string }[] = [
  { marker: "Edg/", name: "Edge" },
  { marker: "OPR/", name: "Opera" },
  { marker: "SamsungBrowser/", name: "Samsung Internet" },
  { marker: "Firefox/", name: "Firefox" },
  { marker: "Chrome/", name: "Chrome" },
  { marker: "Safari/", name: "Safari" },
];
const PlatformMarkerItems: { marker: string; name: string }[] = [
  { marker: "iPhone", name: "iPhone" },
  { marker: "iPad", name: "iPad" },
  { marker: "Android", name: "Android" },
  { marker: "Windows", name: "Windows" },
  { marker: "Macintosh", name: "macOS" },
  { marker: "Linux", name: "Linux" },
];
const UNKNOWN_DEVICE_LABEL = "Unknown device";
// What the row shows instead of the stored user agent, which is unreadable and states more than the reader
// Asked for. A string nothing here recognises reads as unknown rather than being echoed back raw
export const getDeviceLabel = (userAgent: string): string => {
  if (!userAgent) return UNKNOWN_DEVICE_LABEL;
  const browser = BrowserMarkerItems.find(({ marker }) => userAgent.includes(marker))?.name;
  const platform = PlatformMarkerItems.find(({ marker }) => userAgent.includes(marker))?.name;
  if (browser && platform) return `${browser} on ${platform}`;
  return browser ?? platform ?? UNKNOWN_DEVICE_LABEL;
};
