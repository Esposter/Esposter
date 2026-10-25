// The entry a tag's policy names, or undefined when the policy names none for that tag
export const getTagPolicy = <T>(tagPolicies: Record<string, T>, tagName: string): T | undefined =>
  Object.hasOwn(tagPolicies, tagName) ? tagPolicies[tagName] : undefined;
