// GrapesJS routes both the asset-manager drop zone and its file input through one DragEvent-typed
// Handler, so the files live on either the drag payload or the input element — the two members read here
export const readUploadFiles = ({ dataTransfer, target }: Pick<DragEvent, "dataTransfer" | "target">): File[] => {
  const files = dataTransfer?.files ?? (target instanceof HTMLInputElement ? target.files : null);
  return files ? [...files] : [];
};
