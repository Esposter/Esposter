import { EN_US_SEGMENTER } from "#shared/services/intl/constants";

export const isPalindrome = (value: string | undefined): boolean => {
  if (value === undefined) return false;
  const sanitizedValue = value.toLowerCase().replaceAll(/[^a-z0-9]/gu, "");
  return (
    sanitizedValue ===
    Array.from(EN_US_SEGMENTER.segment(sanitizedValue), ({ segment }) => segment)
      .toReversed()
      .join("")
  );
};
