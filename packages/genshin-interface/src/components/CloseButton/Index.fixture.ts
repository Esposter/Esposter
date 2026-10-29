import { CloseButtonMark } from "#src/models/CloseButtonMark";

// The way out of a screen, drawn alone with its cross, and with its back arrow
export const props = { label: "Close", mark: CloseButtonMark.Cross };
export const variants = { back: { mark: CloseButtonMark.Back } };
