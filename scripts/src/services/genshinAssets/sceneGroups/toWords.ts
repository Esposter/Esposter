// A text as the words it is made of, lowercased, apostrophes dropped so "Island's" reads as "islands", and padded with a
// Space at each end so a name is found only as whole words
export const toWords = (text: string): string =>
  ` ${text
    .toLowerCase()
    .replaceAll(/['’]/gu, "")
    .replaceAll(/[^\p{L}\p{N}]+/gu, " ")
    .trim()} `;
