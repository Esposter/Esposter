// An image either says what it shows or is marked as decoration, so an empty alt is always a decision
export const checkHasImageAlt = ({ alt, isDecorative }: { alt: string; isDecorative: boolean }) =>
  isDecorative || alt !== "";
