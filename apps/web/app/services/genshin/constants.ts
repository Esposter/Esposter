// How long the white the login's door fades into holds before the rickroll plays, which is also as long as YouTube has
// To answer before Bilibili plays in its place
export const RICKROLL_DELAY = Temporal.Duration.from({ seconds: 3 });
export const RICKROLL_BILIBILI_URL =
  "https://player.bilibili.com/player.html?bvid=BV1UT42167xb&autoplay=1&danmaku=0&high_quality=1";
// A small file on the embed's own host, so the probe answers for exactly the host the player loads from
export const RICKROLL_YOUTUBE_PROBE_URL = "https://www.youtube-nocookie.com/favicon.ico";
export const RICKROLL_YOUTUBE_URL = "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1";
