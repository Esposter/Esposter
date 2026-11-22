// The folder above `folder`, undefined at a root
export const getParentFolder = (folder: string) => {
  const parent = folder.replace(/[/\\][^/\\]*$/u, "");
  return ["", folder].includes(parent) ? undefined : parent;
};
