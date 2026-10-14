export type FriendPickerModelValue<TMultiple extends boolean> = TMultiple extends true ? string[] : string | undefined;
