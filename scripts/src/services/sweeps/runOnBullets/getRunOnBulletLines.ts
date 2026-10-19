// A bold-led bullet opened after the stop of the sentence before it, on that sentence's line, as an edit that drops the
// Newline between two bullets leaves it. GitHub renders it as the first bullet's text, so the second bullet's lead is
// Lost in a paragraph and no link, diagram or citation check notices
const RUN_ON_BULLET_REGEX = /[.!?)`] ?- \*\*/gu;

// The line of each run-on bullet in a markdown page
export const getRunOnBulletLines = (text: string): number[] =>
  Array.from(text.matchAll(RUN_ON_BULLET_REGEX), ({ index }) => text.slice(0, index).split("\n").length);
