// A resource bound to an invite that is no longer published stays bound, and is said to be unpublished where it is picked
export const getUnpublishedResourceMessage = (name: string) =>
  `"${name}" is unpublished, so it is not offered until it is published.`;
