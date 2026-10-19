const TITLE_SLOT_PATH_REGEX =
  /^(?:(?:normalAttacks\.\d+|chargedAttack|plunges\.[A-Za-z]+)\.hits\.\d+|plungeCollision)$/u;

// Whether a record path is one getSlotPath returns, which the normal attack page fills by the titles of its rows
export const checkIsTitleSlotPath = (path: string): boolean => TITLE_SLOT_PATH_REGEX.test(path);
