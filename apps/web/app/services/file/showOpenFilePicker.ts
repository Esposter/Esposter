import { pickFileInput } from "@/services/file/pickFileInput";

// The File System Access picker where the browser has it, and the hidden file input where it does not
export const showOpenFilePicker = async (options?: OpenFilePickerOptions): Promise<OpenFilePickerHandle[]> => {
  if (window.showOpenFilePicker) return window.showOpenFilePicker(options);

  const files = await pickFileInput(options?.types ?? [], Boolean(options?.multiple));
  return files.map((file) => ({ getFile: () => Promise.resolve(file) }));
};
