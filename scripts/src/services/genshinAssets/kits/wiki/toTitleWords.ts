// A row title or a table label as the words they share, so `1-Hit Swing DMG` and `Swing DMG` both read `swing`. A
// `DMG`, a `per` and an `N-Hit` are dropped, since a label and its row differ by them, and an `ATK` reads as `attack`,
// The wiki's own word for it.
export const toTitleWords = (title: string): string =>
  title
    .toLowerCase()
    .replaceAll(/\b(?:\d+-hit|dmg|per)\b/gu, "")
    .replaceAll(/\batk\b/gu, "attack")
    .replaceAll(/[^a-z]+/gu, " ")
    .trim();
