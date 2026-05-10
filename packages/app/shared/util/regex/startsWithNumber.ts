export const startsWithNumber = (string: string) => new RegExp(String.raw`^\d`, "u").test(string);
