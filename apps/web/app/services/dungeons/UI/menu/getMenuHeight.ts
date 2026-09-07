import { MENU_CURSOR_POSITION_INCREMENT, MENU_PADDING } from "@/services/dungeons/UI/menu/constants";

export const getMenuHeight = (rows: number) => 10 + MENU_PADDING * 2 + rows * MENU_CURSOR_POSITION_INCREMENT.y;
