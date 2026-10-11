// The gcsim folder a character's English name runs together to, `Arataki Itto` the folder `aratakiitto`
export const toGcsimFolderName = (name: string): string => name.toLowerCase().replaceAll(/[^a-z]/gu, "");
