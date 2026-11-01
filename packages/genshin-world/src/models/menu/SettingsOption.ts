// A choice an open settings list offers: its label, whether it is the setting now, and the choice that sets it
export interface SettingsOption {
  choose: () => void;
  isSelected: boolean;
  label: string;
}
