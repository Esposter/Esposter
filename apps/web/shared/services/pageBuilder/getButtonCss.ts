// The rule a button-shaped link is drawn with. A link and a survey invite share it, so they differ only in their
// Selector and colour
export const getButtonCss = (selector: string, backgroundColor: string): string =>
  `${selector} { display: inline-block; padding: 0.5rem 1rem; border-radius: 0.25rem; background-color: ${backgroundColor}; color: #fff; text-decoration: none; }`;
