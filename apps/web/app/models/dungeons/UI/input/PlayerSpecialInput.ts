export enum PlayerSpecialInput {
  Cancel = "Cancel",
  Confirm = "Confirm",
  Enter = "Enter",
}

export const PlayerSpecialInputs: ReadonlySet<PlayerSpecialInput> = new Set(Object.values(PlayerSpecialInput));
