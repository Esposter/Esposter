import { parseUserAgent } from "#server/services/auth/parseUserAgent";

// The row shows this label in place of the stored user agent, which is unreadable and says more than the row needs.
// The parse runs here rather than on the client, so the raw agent never leaves the server
export const getDeviceLabel = (userAgent: string): string => {
  const { browserName, browserVersion, deviceModel, operatingSystemName } = parseUserAgent(userAgent);
  // The major alone: a browser ships a new patch every few days, and nobody recognises their session by one
  const browserLabel = browserName && browserVersion ? `${browserName} ${browserVersion}` : browserName;
  // The model is the more specific of the two, so it wins wherever the agent names one. Neither gets a version.
  // Windows 11 still says `NT 10.0`, and Safari and Chrome both freeze macOS at `10_15_7`.
  // A version here would be confidently wrong rather than merely absent
  const deviceLabel = deviceModel ?? operatingSystemName;
  if (browserLabel && deviceLabel) return `${browserLabel} on ${deviceLabel}`;
  return browserLabel ?? deviceLabel ?? "Unknown device";
};
