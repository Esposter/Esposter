export const downloadUrl = (url: string, filename: string) => {
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
};
