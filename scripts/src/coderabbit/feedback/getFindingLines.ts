// Sections whose content is machinery rather than findings. The list is what gets suppressed; everything else
// Prints, so a bucket nobody has seen before shows up by default instead of silently.
const BOILERPLATE_REGEX =
  /^(?:\*\*)?(?:Review info|Run configuration|Commits|Files selected|Files ignored|Files with no reviewable|Files skipped|Autofix|Prompt for|Tip\b|Thanks for using|Fix all unresolved|---)/u;
// Every boilerplate heading pairs its emoji with fixed text, so stripping the pictographs leaves the text
// Alternatives to do the whole job. Matching a bare emoji instead would suppress whatever followed it, and an
// Unseen bucket carrying a listed emoji is exactly what this filter exists to surface.
const EMOJI_PREFIX_REGEX = /^[\p{Extended_Pictographic}\u{FE0F}\u{200D}]+\s*/u;
const FENCED_BLOCK_REGEX = /```[\s\S]*?```/gu;
const HTML_TAG_REGEX = /<[^>]*>/gu;
// A counted heading (`Nitpick comments (3)`) opens a findings bucket; a markdown heading reopens the filter for
// The walkthrough's own sections, which carry no count — without it the first `Files selected for processing
// (4)` latches and swallows every later section, including the merge risk, while exiting 0.
const COUNTED_HEADING_REGEX = /\(\d+\)$/u;
const OPENING_HEADING_REGEX = /^(?:#{1,6} |\*\*Actionable comments posted:)/u;

export const getFindingLines = (body: string): string[] => {
  let isBoilerplate = false;
  return body
    .replaceAll(FENCED_BLOCK_REGEX, "")
    .replaceAll(HTML_TAG_REGEX, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => {
      const heading = line.replace(EMOJI_PREFIX_REGEX, "");
      if (BOILERPLATE_REGEX.test(heading)) isBoilerplate = true;
      else if (COUNTED_HEADING_REGEX.test(heading) || OPENING_HEADING_REGEX.test(heading)) isBoilerplate = false;
      return !isBoilerplate;
    });
};
