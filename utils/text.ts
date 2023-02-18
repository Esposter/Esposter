export const insertText = (string: string, index: number, item: string) => {
  return `${string.slice(0, index)}${item}${string.slice(index)}`;
};

const STANDARD_PUNCTUATION_REGEX = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/;

export const sanitiseText = (string: string) => {
  const result = string.trim();
  for (let i = result.length - 1; i >= 0; i--) {
    if (result[i].match(STANDARD_PUNCTUATION_REGEX)) return result;
    if (result[i] !== "\n") return insertText(result, i + 1, ".");
  }
  return result;
};

export const streamToText = async (readable: NodeJS.ReadableStream) => {
  readable.setEncoding("utf8");
  let data = "";
  for await (const chunk of readable) data += chunk;
  return data;
};

export const getInitials = (fullName: string) => {
  const allNames = fullName.trim().split(" ");
  const initials = allNames.reduce((acc, curr, index) => {
    if (index === 0 || index === allNames.length - 1) return `${acc}${curr.charAt(0).toUpperCase()}`;
    return acc;
  }, "");
  return initials;
};

export const toTitleCase = (string: string) => string.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());

export const EMPTY_TEXT_REGEX = /^\s*$/;
