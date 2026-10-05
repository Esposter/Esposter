// How long YouTube has to answer the probe the page sends as it loads; the splashes alone outlast it, so the answer is
// In before anyone reaches the door
export const RICKROLL_PROBE_TIMEOUT = Temporal.Duration.from({ seconds: 10 });
export const RICKROLL_BILIBILI_URL =
  "https://player.bilibili.com/player.html?bvid=BV1UT42167xb&autoplay=1&danmaku=0&high_quality=1";
export const RICKROLL_YOUTUBE_ORIGIN = "https://www.youtube-nocookie.com";
// A small file on the embed's own host, so the probe answers for exactly the host the player loads from
export const RICKROLL_YOUTUBE_PROBE_URL = `${RICKROLL_YOUTUBE_ORIGIN}/favicon.ico`;
// How long YouTube's player has to answer the page's listening handshake before Bilibili's upload plays in its place
export const RICKROLL_YOUTUBE_READY_TIMEOUT = Temporal.Duration.from({ seconds: 10 });
// Played on the page's command rather than on load, which the frame API takes
export const RICKROLL_YOUTUBE_URL = `${RICKROLL_YOUTUBE_ORIGIN}/embed/dQw4w9WgXcQ?enablejsapi=1`;
