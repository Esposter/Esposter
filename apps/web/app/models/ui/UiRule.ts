// What a field checks as the reader types: true when the text passes, or the message saying why it does not
export type UiRule = (value: string) => string | true;
