// Whether a tag of this name was read before, recording it as read: a repeat is refused under its name, rather than merged into the first
export const checkIsRepeatedMjmlTag = (tagName: string, readTagNames: Set<string>): boolean => {
  const isRepeated = readTagNames.has(tagName);
  readTagNames.add(tagName);
  return isRepeated;
};
