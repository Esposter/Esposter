// The options sit after the command and an optional `args` array, and before a callback. An `args` slot passed as
// `undefined` still holds its place when options follow it, so they sit after it too; a lone `undefined` is the options
// Slot, as in `execSync(command, undefined)`. A caller's options are kept, with `windowsHide` forced last so they cannot
// Re-show the window; no options gets the hidden one inserted there.
export const withHiddenWindow = (parameters: unknown[]): unknown[] => {
  const hasArgsSlot = Array.isArray(parameters[0]) || (parameters[0] === undefined && parameters.length > 1);
  const optionsIndex = hasArgsSlot ? 1 : 0;
  const options = parameters[optionsIndex];
  if (typeof options === "object" && options !== null)
    return parameters.toSpliced(optionsIndex, 1, { ...options, windowsHide: true });
  const isPlaceholder = options === undefined && optionsIndex < parameters.length;
  return parameters.toSpliced(optionsIndex, Number(isPlaceholder), { windowsHide: true });
};
