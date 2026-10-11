// The fallback where the File System Access API is missing: a hidden file input opens the browser's own dialog
// So the same picker shows everywhere. A dismissed dialog rejects as AbortError, the name the native picker uses
export const pickFileInput = (types: FilePickerType[], multiple: boolean) =>
  new Promise<File[]>((resolve, reject) => {
    const input = window.document.createElement("input");
    input.type = "file";
    input.multiple = multiple;
    input.accept = types
      .flatMap(({ accept }) =>
        Object.entries(accept).flatMap(([mimeType, extensions]) => [mimeType, extensions].flat()),
      )
      .join(",");
    input.hidden = true;
    window.document.body.append(input);

    const abort = () => {
      input.remove();
      reject(new DOMException("The user aborted a request.", "AbortError"));
    };

    input.addEventListener(
      "change",
      () => {
        input.remove();
        const files = [...(input.files ?? [])];
        // Some browsers clear the selection on a cancel and report it as a change, so an empty one is a cancel too
        if (files.length === 0) {
          abort();
          return;
        }

        resolve(files);
      },
      { once: true },
    );
    input.addEventListener("cancel", abort, { once: true });
    input.click();
  });
