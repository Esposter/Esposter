import { ClickerType } from "@/models/clicker/ClickerType";

export const getColorMap = ({ primary, error, info }: ReturnType<typeof useColors>) =>
  ({
    [ClickerType.Default]: primary.value,
    [ClickerType.Physical]: error.value,
    [ClickerType.Magical]: info.value,
  }) satisfies Record<ClickerType, string>;
