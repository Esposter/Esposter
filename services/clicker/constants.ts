import { dayjs } from "@/services/dayjs";

export const SAVE_FILENAME = "save.json";
export const ITEM_NAME = "Piña Colada";
export const AUTOSAVE_INTERVAL = dayjs.duration(60, "seconds").milliseconds();
export const FPS = 60;

// local storage key
export const CLICKER_STORE = "clicker-store";

const CLICKER_PUBLIC_FOLDER_PATH = "/clicker";
export const PINA_COLADA_PATH = `${CLICKER_PUBLIC_FOLDER_PATH}/pina-colada.svg`;
