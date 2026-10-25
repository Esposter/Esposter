// The suffix of the first tag under a prefix, or undefined where no tag holds that prefix
export const findTagSuffix = (tagList: string[], prefix: string): string | undefined =>
  tagList.find((tag) => tag.startsWith(prefix))?.slice(prefix.length);
