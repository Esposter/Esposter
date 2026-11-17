// The root's props from what was read of its document: an absent language and title are empty, the value the root holds for them
export const readMjmlRootProps = (entries: [string, unknown][]): Record<string, unknown> => ({
  lang: "",
  title: "",
  ...Object.fromEntries(entries),
});
