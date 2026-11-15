import { checkIsTypingElsewhere } from "@/services/ui/checkIsTypingElsewhere";

// The one route for a control that asks for focus as it mounts into a live page. The browser's own autofocus is ignored
// For anything added after the page loaded, so the control takes focus itself: once, the first time its element exists
// And it is wanted, and only from a reader who is not typing somewhere else. An overlay's control is the exception,
// Since the browser runs the autofocus attribute when a dialog opens, which this leaves to it
export const useAutofocus = (
  target: MaybeRefOrGetter<HTMLElement | null | undefined>,
  isEnabled: MaybeRefOrGetter<boolean | undefined> = true,
) => {
  const element = computed(() => (toValue(isEnabled) ? (toValue(target) ?? undefined) : undefined));
  const stop = watch(
    element,
    (newElement) => {
      if (!newElement) return;

      stop();
      if (!checkIsTypingElsewhere(newElement)) newElement.focus();
    },
    { flush: "post" },
  );
};
