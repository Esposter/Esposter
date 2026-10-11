// https://developer.mozilla.org/docs/Web/API/File_System_API
// Ambient types for the File System Access pickers, which lib.dom does not yet declare
// Both are optional on window: a browser without them is served by the hidden input and download in services/file
interface FilePickerType {
  accept: Record<string, string[]>;
  description?: string;
}

interface OpenFilePickerHandle {
  getFile: () => Promise<File>;
}

interface OpenFilePickerOptions {
  multiple?: boolean;
  types?: FilePickerType[];
}

interface SaveFilePickerHandle {
  createWritable: () => Promise<SaveFilePickerWritable>;
}

interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: FilePickerType[];
}

interface SaveFilePickerWritable {
  abort: () => Promise<void>;
  close: () => Promise<void>;
  write: (data: Blob) => Promise<void>;
}

interface Window {
  showOpenFilePicker?: (options?: OpenFilePickerOptions) => Promise<OpenFilePickerHandle[]>;
  showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<SaveFilePickerHandle>;
}
