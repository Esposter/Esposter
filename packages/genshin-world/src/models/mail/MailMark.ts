/* The traced marks the Mail screen draws where the game draws its own: the header's pin, folder, help and pointer marks,
   the list's person and star, the claim arrows, the delete mark */
export const MailMark = {
  ClaimAllArrow: "ClaimAllArrow",
  ClaimArrow: "ClaimArrow",
  GiftBoxFolder: "GiftBoxFolder",
  Help: "Help",
  Pin: "Pin",
  Pointer: "Pointer",
  Sender: "Sender",
  Star: "Star",
  Trash: "Trash",
} as const;
export type MailMark = (typeof MailMark)[keyof typeof MailMark];
