// A design is open when a `no source yet` line sits outside the unchecked task lines that name an open question.
// Or when it has neither a `## Sources` section nor a link to the parity references.
export const checkIsOpenGenshinDesign = (text: string): boolean => {
  const hasOpenProse = text.split("\n").some((line) => line.includes("no source yet") && !/^\s*- \[ \] /u.test(line));
  const hasSources = /^## Sources/mu.test(text) || text.includes("genshin-parity/references/");
  return hasOpenProse || !hasSources;
};
