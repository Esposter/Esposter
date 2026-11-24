// A file a line locator names: the nearest file its sentence names before it, else the one an `of` or `in` after it
// Names, since a sentence reads `lines 5 to 7 of <file>` as often as `<file>, lines 5 to 7`. A `{data-root}` or
// `{cache-root}` path names a file outside the repository whatever its extension, so it is read as a file even where no
// Extension below names it
const FILE_PATTERN = String.raw`(?:\{(?:cache|data)-root\}[^\s\x60'"()[\]<>,;|*]*|[^\s\x60'"()[\]<>,;|*]*?\.(?:[cm]?[jt]sx?|vue|css|json|md|ya?ml|svg|html|sh|ps1|toml|txt|snap|lock|go|cs|cpp|cc|h|c|asm|tsv|csv|sql|xml|wgsl|glsl|hlsl|cginc|png|jpe?g|mkv|mp4|wav|ogg|mp3|pdf|dll|exe|bin|log|dat|xlsx)(?!\w))`;
const FILE_REGEX = new RegExp(`(?<file>${FILE_PATTERN})`, "gu");
const FOLLOWING_FILE_REGEX = new RegExp(`^\\s*,?\\s*(?:of|in|from)\\s+\\x60?(?<file>${FILE_PATTERN})`, "u");

export const getCitedFile = (line: string, start: number, end: number): string | undefined => {
  // A sentence ends at a full stop or a semicolon followed by a space, so a file named in an earlier one
  // Is no candidate for this sentence's file
  const boundary = Math.max(line.lastIndexOf(". ", start), line.lastIndexOf("; ", start));
  const sentenceFiles = Array.from(
    line.slice(boundary + 1, start).matchAll(FILE_REGEX),
    ({ groups }) => groups?.file ?? "",
  );

  return sentenceFiles.at(-1) ?? FOLLOWING_FILE_REGEX.exec(line.slice(end))?.groups?.file;
};
