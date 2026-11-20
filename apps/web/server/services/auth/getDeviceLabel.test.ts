import { getDeviceLabel } from "#server/services/auth/getDeviceLabel";
import { describe, expect, test } from "vitest";

describe(getDeviceLabel, () => {
  // The label is a browser and the most specific device the agent string names.
  // It withholds an OS version, which the string cannot be trusted on, and any browser the agent does not state
  test.each([
    [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0",
      "Microsoft Edge 141 on Windows",
    ],
    // Windows 11 sends `NT 10.0` and macOS is frozen at `10_15_7`, so neither row states an OS version
    [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Chrome 141 on macOS",
    ],
    // A model is the more specific claim, so it wins over the OS name wherever the table has one
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      "Safari 18 on iPhone",
    ],
    // Not only Apple: a Huawei handset the agent names by model reads as that model, so it beats `Android`
    [
      "Mozilla/5.0 (Linux; Android 7.0; CAN-L01 Build/HUAWEICAN-L01) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36",
      "Chrome 141 on Nova",
    ],
    // Chrome froze the Android model to `K`, so the OS name is genuinely all that is left to say
    [
      "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36",
      "Chrome 141 on Android",
    ],
    // A real model in the string still does not reach the label, since the table names no Samsung model
    [
      "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36",
      "Samsung Internet for Android 25 on Android",
    ],
    // `Mozilla` is the product every agent starts with, and is not a browser the agent names
    ["Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Windows"],
    ["Firefox/143.0", "Firefox 143"],
    ["curl/8.7.1", "Unknown device"],
    ["", "Unknown device"],

    // Desktop browsers, each with its own token and the OS its agent states
    [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.19582",
      "Microsoft Edge 18 on Windows",
    ],
    ["Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0", "Firefox 143 on Windows"],
    [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
      "Safari 17 on macOS",
    ],
    ["Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:143.0) Gecko/20100101 Firefox/143.0", "Firefox 143 on macOS"],
    [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0",
      "Microsoft Edge 141 on macOS",
    ],
    [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
      "Chrome 86 on macOS",
    ],
    ["Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0", "Firefox 143 on Linux"],
    // A distribution reads as the Linux kernel it states, since no distribution name is in the table
    ["Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:62.0) Gecko/20100101 Firefox/62.0", "Firefox 62 on Linux"],
    [
      "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Chrome 141 on Chrome OS",
    ],
    // A Chromium build names its own brand rather than Chrome, which its agent states beside it
    [
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/50.0.2661.102 Chrome/50.0.2661.102 Safari/537.36",
      "Chromium 50 on Linux",
    ],
    [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0",
      "Opera 106 on Windows",
    ],
    [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.119 Safari/537.36 Vivaldi/6.5.3206.53",
      "Vivaldi 6 on macOS",
    ],
    // The version is the digits up to the next separator; the letters the agent appends after it are not read
    [
      "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36 OPR/82.0.4227.58/VoplfMPIL3LW69FfgZ",
      "Opera 82 on Windows",
    ],

    // The iPhone and iPad rows, each with the browser it runs
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/141.0.7390.54 Mobile/15E148 Safari/604.1",
      "Chrome 141 on iPhone",
    ],
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/143.0 Mobile/15E148 Safari/605.1.15",
      "Firefox 143 on iPhone",
    ],
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/141.0.3537.92 Version/18.0 Mobile/15E148 Safari/604.1",
      "Microsoft Edge 141 on iPhone",
    ],
    [
      "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      "Safari 18 on iPad",
    ],
    [
      "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/141.0.7390.54 Mobile/15E148 Safari/604.1",
      "Chrome 141 on iPad",
    ],
    // Some agents write the model in lower case, which the table matches the same way
    [
      "Mozilla/5.0 (ipad; CPU OS 8_0 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12A365 Safari/600.1.4",
      "Safari 8 on iPad",
    ],
    [
      "Mozilla/5.0 (iPod touch; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
      "Safari 15 on iPod",
    ],
    // Firefox for iPad sends a Mac-framed agent, but its iOS-only token names iOS and no model is guessed
    [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/21.0 Version/13.0.3 Safari/605.1.15",
      "Firefox 21 on iOS",
    ],
    // A Yandex browser on iPhone names its own brand over the Safari tokens it shares
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 YaBrowser/19.3.3.157.10 Mobile/15E148 Safari/605.1",
      "Yandex Browser 19 on iPhone",
    ],

    // Android agents, each read by the token it states
    ["Mozilla/5.0 (Android 14; Mobile; rv:143.0) Gecko/143.0 Firefox/143.0", "Firefox 143 on Android"],
    [
      "Mozilla/5.0 (Linux; Android 10; SM-A515W) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.116 Mobile Safari/537.36 EdgA/46.01.4.5140",
      "Microsoft Edge 46 on Android",
    ],
    // The Oreo build string carries `OPR` without a slash after it, so it names no Opera
    [
      "Mozilla/5.0 (Linux; Android 8.0.0; Nexus 5X Build/OPR6.170623.013) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.107 Mobile Safari/537.36",
      "Chrome 60 on Android",
    ],
    // A device whose model reads `edge` names no Microsoft Edge, since the Edge token needs its slash
    [
      "Mozilla/5.0 (Linux; Android 13; motorola edge 60 fusion; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/141.0.0.0 Mobile Safari/537.36",
      "Chrome 141 on Android",
    ],
    [
      "Mozilla/5.0 (Linux; U; Android 10; en-US; SM-A515F Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/78.0.3904.108 UCBrowser/13.3.0.1305 Mobile Safari/537.36",
      "UC Browser 13 on Android",
    ],
    // Newer UC Browser builds drop the `UCBrowser` token for `UCMobile`, which names the same browser
    [
      "Mozilla/5.0 (Linux; Android 16; en-US; SM-S918B Build/BP2A.250605.031.A3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.80 UCMobile/15.0.7.1383 Mobile Safari/537.36",
      "UC Browser 15 on Android",
    ],
    // A token with spaces around its slash still names its version
    [
      "Mozilla / 5.0 (Linux; Android 9; SM-T825Y) AppleWebKit / 537.36 (KHTML like Gecko) Version/13.0.3 Chrome / 86.0.4240.99 Safari/ 537.36",
      "Chrome 86 on Android",
    ],
    ["Mozilla/5.0 (Android; Mobile; rv:30.0) Gecko/30.0 Firefox/30.0", "Firefox 30 on Android"],
    // A Windows Phone agent carries Android and iPhone tokens too, and names the platform it is on first
    [
      "Mozilla/5.0 (Mobile; Windows Phone 8.1; Android 4.0; ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0; Microsoft; Lumia 640 LTE) like iPhone OS 7_0_3 Mac OS X AppleWebKit/537 (KHTML, like Gecko) Mobile Safari/537",
      "Windows",
    ],
  ])("reads %# as the most specific device the string knows", (userAgent, label) => {
    expect.hasAssertions();

    expect(getDeviceLabel(userAgent)).toBe(label);
  });

  // These agents name no browser of their own. An in-app webview or a desktop engine carries Safari's token.
  // Without the Version or Mobile token that would name Safari, the label keeps only the device stated
  test.each([
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Cordova/3.5.0 inWrapper BlaCasino/0.0.1",
      "iPhone",
    ],
    [
      "Mozilla/5.0 (iPad; CPU OS 12_1_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16D57 [FBAN/FBIOS;FBAV/271.0.0.71.103;FBBV/215604415;FBDV/iPad4,2;FBMD/iPad;FBSN/iOS;FBSV/12.1.4;FBSS/2;FBID/tablet;FBLC/en_GB;FBOP/5;FBRV/217399145]",
      "iPad",
    ],
    // A home-screen web app sends Safari's Mobile token and no version, so its browser is still named
    [
      "Mozilla/5.0 (iPad; CPU OS 9_3_5 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13G36 Safari/601.1",
      "Safari on iPad",
    ],
    [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) WebBrowserWidget/++UE4+Release-4.20-CL-4369336 UnrealEngine/4.20.3-4369336+++UE4+Release-4.20 Safari/537.36",
      "Windows",
    ],
    [
      "Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.21 (KHTML, like Gecko) QupZilla/1.8.6 Safari/537.21",
      "Windows",
    ],
    // A desktop-mode iPad sends a Mac agent with no iPad token, so Apple's own framing reads it as macOS
    [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15",
      "Safari 13 on macOS",
    ],
  ])("reads %# from the tokens it states, naming no browser it does not", (userAgent, label) => {
    expect.hasAssertions();

    expect(getDeviceLabel(userAgent)).toBe(label);
  });

  test("never carries markup from the agent into the label", () => {
    expect.hasAssertions();

    // The payload follows a real token and is never read, so the label is the token's own name and version
    expect(
      getDeviceLabel("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/141.0.0.0 <img src=x onerror=alert(1)>"),
    ).toBe("Chrome 141 on Windows");
  });

  test("never names a brand the agent invents", () => {
    expect.hasAssertions();

    // A brand outside the table is never read from the agent, so only the OS it states reaches the label
    expect(getDeviceLabel("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Evil/9.9 Hacker/1.0")).toBe("Windows");
  });

  test("names no browser whose version runs past four digits", () => {
    expect.hasAssertions();

    // The version fails its token rather than being cut short, so the label never carries a digit run the agent set
    expect(getDeviceLabel("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/123456789")).toBe("Windows");
  });
});
