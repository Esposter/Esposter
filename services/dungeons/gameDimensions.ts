import { APP_BAR_HEIGHT } from "@/services/esposter/constants";

export const getGameWidth = () => window.innerWidth;
export const getGameHeight = () => window.innerHeight - APP_BAR_HEIGHT;
