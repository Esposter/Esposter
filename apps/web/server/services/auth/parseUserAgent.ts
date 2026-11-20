interface NamedPattern {
  name: string;
  pattern: RegExp;
}

interface UserAgentReading {
  browserName?: string | undefined;
  browserVersion?: string | undefined;
  deviceModel?: string | undefined;
  operatingSystemName?: string | undefined;
}

// A version that runs past four digits fails its token instead of being cut short.
// So the label never shows a truncated number or a digit run the agent chose
const createBrowserPattern = (tokens: string[]) =>
  new RegExp(`\\b(?:${tokens.join("|")})\\s*\\/\\s*(?<version>\\d{1,4})(?!\\d)`, "u");

// A brand is found by its own token, before the engine tokens it shares. So a Chromium build names
// Chromium, not the Chrome token it also carries
const BROWSER_PATTERNS: NamedPattern[] = [
  { name: "Microsoft Edge", pattern: createBrowserPattern(["Edg", "Edge", "EdgA", "EdgiOS"]) },
  { name: "Opera", pattern: createBrowserPattern(["OPR", "OPiOS"]) },
  { name: "Samsung Internet for Android", pattern: createBrowserPattern(["SamsungBrowser"]) },
  { name: "Vivaldi", pattern: createBrowserPattern(["Vivaldi"]) },
  { name: "Yandex Browser", pattern: createBrowserPattern(["YaBrowser"]) },
  { name: "UC Browser", pattern: createBrowserPattern(["UCBrowser", "UCMobile"]) },
  { name: "Firefox", pattern: createBrowserPattern(["Firefox", "FxiOS"]) },
  { name: "Chromium", pattern: createBrowserPattern(["Chromium"]) },
  { name: "Chrome", pattern: createBrowserPattern(["Chrome", "CriOS"]) },
];

const getFirstMatch = (patterns: NamedPattern[], userAgent: string) => {
  for (const { name, pattern } of patterns) {
    const match = pattern.exec(userAgent);
    if (match) return { name, version: match.groups?.version };
  }
  return undefined;
};

const SAFARI_TOKEN_REGEX = /\bSafari\//u;
const SAFARI_VERSION_REGEX = /\bVersion\/(?<version>\d{1,4})(?!\d)/u;
const IOS_MOBILE_TOKEN_REGEX = /\bMobile\//u;

// Safari is named only with its Version token, or with the Mobile token iOS WebKit sends where it omits the
// Version. A Safari token alone also comes from a desktop engine or a Qt shell, so it names nothing by itself
const getBrowser = (userAgent: string): UserAgentReading => {
  const token = getFirstMatch(BROWSER_PATTERNS, userAgent);
  if (token) return { browserName: token.name, browserVersion: token.version };
  if (!SAFARI_TOKEN_REGEX.test(userAgent)) return {};
  const version = SAFARI_VERSION_REGEX.exec(userAgent)?.groups?.version;
  if (version === undefined && !IOS_MOBILE_TOKEN_REGEX.test(userAgent)) return {};
  return { browserName: "Safari", browserVersion: version };
};

// Windows comes first, since a Windows Phone agent carries Android and iPhone tokens too.
// The iOS-only browser tokens name iOS on their own, so a Mac-framed agent from an iOS browser still reads as iOS
const OPERATING_SYSTEM_PATTERNS: NamedPattern[] = [
  { name: "Windows", pattern: /Windows/u },
  { name: "Android", pattern: /\bAndroid\b/u },
  { name: "iOS", pattern: /(?<!like )\b(?:iPhone|iPad|iPod)\b|\b(?:CriOS|FxiOS|EdgiOS|OPiOS)\//iu },
  { name: "macOS", pattern: /Macintosh|Mac OS X/u },
  { name: "Chrome OS", pattern: /\bCrOS\b/u },
  { name: "Linux", pattern: /\bLinux\b/u },
];

// A model reads only where the agent names the device itself, so "like iPhone OS" on another platform is not one
const DEVICE_MODEL_PATTERNS: NamedPattern[] = [
  { name: "iPad", pattern: /(?<!like )\biPad\b/iu },
  { name: "iPod", pattern: /(?<!like )\biPod\b/iu },
  { name: "iPhone", pattern: /(?<!like )\biPhone\b/iu },
  { name: "Nova", pattern: /CAN-L01/iu },
];

export const parseUserAgent = (userAgent: string): UserAgentReading => ({
  ...getBrowser(userAgent),
  deviceModel: getFirstMatch(DEVICE_MODEL_PATTERNS, userAgent)?.name,
  operatingSystemName: getFirstMatch(OPERATING_SYSTEM_PATTERNS, userAgent)?.name,
});
