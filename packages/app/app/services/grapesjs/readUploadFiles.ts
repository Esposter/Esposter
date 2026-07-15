// GrapesJS routes both the asset-manager drop zone and its file input through one DragEvent-typed
// Handler, so the files live on either the drag payload or the input element
export const readUploadFiles = (event: DragEvent): File[] => {
  const { target } = event;
  const files = event.dataTransfer?.files ?? (target instanceof HTMLInputElement ? target.files : null);
  return files ? Array.from(files) : [];
};
