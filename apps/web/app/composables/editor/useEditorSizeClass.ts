import { SizeClass } from "vue-editor-layout-headless";

// The page's drawers are sheets below the mobile breakpoint, so that is the medium class, and a window below the first
// Breakpoint is the compact one
export const useEditorSizeClass = () => {
  const { isMobile, xs: isCompact } = useUiDisplay();
  return computed(() => {
    if (isCompact.value) return SizeClass.Compact;
    else if (isMobile.value) return SizeClass.Medium;
    else return SizeClass.Expanded;
  });
};
