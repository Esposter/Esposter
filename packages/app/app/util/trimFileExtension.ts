export const trimFileExtension = (path: string) => path.replace(new RegExp(String.raw`\.[^/.]+$`, "u"), "");
