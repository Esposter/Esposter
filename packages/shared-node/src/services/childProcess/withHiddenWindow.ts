// The options sit after the command and an optional `args` array, and before a callback. A caller's options are kept,
// With `windowsHide` forced last so they cannot re-show the window; no options gets the hidden one inserted there.
export const withHiddenWindow = (parameters: unknown[]): unknown[] => {
  const optionsIndex = Array.isArray(parameters[0]) ? 1 : 0;
  const options = parameters[optionsIndex];
  if (typeof options === "object" && options !== null)
    return parameters.toSpliced(optionsIndex, 1, { ...options, windowsHide: true });
  const isPlaceholder = options === undefined && optionsIndex < parameters.length;
  return parameters.toSpliced(optionsIndex, Number(isPlaceholder), { windowsHide: true });
};
