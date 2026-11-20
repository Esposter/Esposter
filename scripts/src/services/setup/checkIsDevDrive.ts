import { DEV_DRIVE_REGEX } from "#src/services/setup/constants";

// A volume is a Dev Drive when `fsutil devdrv query` says it is one, trusted or not
export const checkIsDevDrive = (output: null | string): boolean => output !== null && DEV_DRIVE_REGEX.test(output);
