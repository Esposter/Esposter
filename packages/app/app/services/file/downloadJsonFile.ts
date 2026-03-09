export const downloadJsonFile = (filename: string, data: string | unknown) => {
  const json = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.json`;
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
