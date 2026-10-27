// The key sins scores with: the plugin's own option when it is set, else the variable. A blank option is no key, so the
// Variable answers, and `||` is what makes it so, since `??` would keep a blank option over a variable that holds one
export const pickTypeSafeKey = (typeSafeKey: string, variableKey: string | undefined): string =>
  typeSafeKey || variableKey || "";
