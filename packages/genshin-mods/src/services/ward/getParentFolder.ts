// The folder above `folder`, undefined at a root
export const getParentFolder = (folder: string): string | undefined => {
  const parent = folder.replace(/[/\\][^/\\]*$/u, "");
  return parent === folder || parent === "" ? undefined : parent;
};
