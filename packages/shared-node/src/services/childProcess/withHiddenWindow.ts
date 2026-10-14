// The options sit after the command and an optional `args` array, and before a callback. An `args` slot passed as
// `undefined` still holds its place, so the options sit after it too. A caller's options are kept, with `windowsHide`
// Forced last so they cannot re-show the window; no options gets the hidden one inserted there.
export const withHiddenWindow = (parameters: unknown[]): unknown[] => {
  const hasArgsSlot = Array.isArray(parameters[0]) || (parameters[0] === undefined && parameters.length > 0);
  const optionsIndex = hasArgsSlot ? 1 : 0;
  const options = parameters[optionsIndex];
  if (typeof options === "object" && options !== null)
    return parameters.toSpliced(optionsIndex, 1, { ...options, windowsHide: true });
  const isPlaceholder = options === undefined && optionsIndex < parameters.length;
  return parameters.toSpliced(optionsIndex, Number(isPlaceholder), { windowsHide: true });
};
