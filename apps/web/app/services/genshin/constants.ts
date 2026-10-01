// How long the white the login's door fades into holds before the rickroll plays
export const RICKROLL_DELAY = Temporal.Duration.from({ seconds: 3 });
// How long YouTube has to answer the probe the page sends as it loads; the splashes alone outlast it, so the answer is in
// Before anyone reaches the door
export const RICKROLL_PROBE_TIMEOUT = Temporal.Duration.from({ seconds: 10 });
export const RICKROLL_BILIBILI_URL =
  "https://player.bilibili.com/player.html?bvid=BV1UT42167xb&autoplay=1&danmaku=0&high_quality=1";
// A small file on the embed's own host, so the probe answers for exactly the host the player loads from
export const RICKROLL_YOUTUBE_PROBE_URL = "https://www.youtube-nocookie.com/favicon.ico";
export const RICKROLL_YOUTUBE_URL = "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1";
