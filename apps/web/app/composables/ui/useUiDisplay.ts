import { BREAKPOINTS_NAMESPACE } from "@/services/ui/constants";
import { useBreakpoints } from "@vuetify/v0";

// The screen's width and which breakpoints it is past, read once for the whole app. The server has no screen, so it
// Renders as the narrowest until the client measures
export const useUiDisplay = () => useBreakpoints(BREAKPOINTS_NAMESPACE);
