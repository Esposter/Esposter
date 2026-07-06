// https://developer.mozilla.org/docs/Web/API/Window/showDirectoryPicker
// Ambient types for the File System Access directory picker (Chromium-only, not yet in lib.dom).
interface ShowDirectoryPickerOptions {
  id?: string;
  mode?: "read" | "readwrite";
  startIn?: FileSystemHandle | string;
}

// Chromium-only — callers must guard with `"showDirectoryPicker" in window`
interface Window {
  readonly showDirectoryPicker: (options?: ShowDirectoryPickerOptions) => Promise<FileSystemDirectoryHandle>;
}
