import Bowser from "bowser";

const UNKNOWN_DEVICE_LABEL = "Unknown device";
// Bowser's last browser matcher is a catch-all that pulls any `Name/Version` pair out of the string, so an
// Agent it does not recognise still comes back named — `Mozilla`, or whatever the string happens to start
// With. Its own vocabulary is the filter: a name outside this set is a claim bowser never actually made
const BrowserNames = new Set(Object.values(Bowser.BROWSER_MAP));
// What the row shows instead of the stored user agent, which is unreadable and states more than the reader
// Asked for. The parse runs here rather than on the client so the raw agent never leaves the server
export const getDeviceLabel = (userAgent: string): string => {
  // Bowser throws on an empty string rather than returning an empty parse
  if (!userAgent) return UNKNOWN_DEVICE_LABEL;
  const { browser, os, platform } = Bowser.parse(userAgent);
  const browserName = browser.name && BrowserNames.has(browser.name) ? browser.name : undefined;
  // The major alone: a browser ships a new patch every few days, and nobody recognises their session by one
  const browserVersion = browser.version?.split(".")[0];
  const browserLabel = browserName && browserVersion ? `${browserName} ${browserVersion}` : browserName;
  // The model is the more specific of the two and only Apple publishes one — every other vendor's model was
  // Frozen out of the agent string, so `Android` is genuinely all the string knows. The OS carries the rest.
  // Neither gets a version: Windows 11 still says `NT 10.0`, and Safari and Chrome both freeze macOS at
  // `10_15_7`, so a version here would be confidently wrong rather than merely absent
  const deviceLabel = platform.model ?? os.name;
  if (browserLabel && deviceLabel) return `${browserLabel} on ${deviceLabel}`;
  return browserLabel ?? deviceLabel ?? UNKNOWN_DEVICE_LABEL;
};
