import type { VBtn } from "vuetify/components";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";

// A Vuetify button's props in the library button's words, for the Styled wrappers whose call sites still pass them: a
// Text or plain variant as quiet, a destructive or cautionary colour as danger, the primary colour as the accent, a
// Pending state as the spinner, and its mark as an icon class. Vuetify's sizes, densities, ripple and corners mean
// Nothing on the library's button, and whatever else is left — a submit type, the form it submits, a class — is an
// Attribute of the element
export const getUiButtonProps = (
  {
    color,
    density: _density,
    disabled,
    flat: _flat,
    icon,
    loading,
    prependIcon,
    ripple: _ripple,
    size: _size,
    text,
    tile: _tile,
    variant,
    ...attributes
  }: VBtn["$props"],
  defaultVariant?: UiButtonVariant,
) => {
  const iconClass = typeof icon === "string" ? icon : "";
  let uiButtonVariant = defaultVariant;
  if (variant === "plain" || variant === "text") uiButtonVariant = UiButtonVariant.Quiet;
  else if (color === "error" || color === "warning") uiButtonVariant = UiButtonVariant.Danger;
  else if (color === "primary") uiButtonVariant = UiButtonVariant.Accent;
  else if (variant === "outlined" || variant === "tonal") uiButtonVariant = undefined;
  return {
    attributes,
    icon: typeof prependIcon === "string" ? prependIcon : iconClass,
    isDisabled: Boolean(disabled) || Boolean(loading),
    isLoading: Boolean(loading),
    text: text === undefined ? "" : String(text),
    variant: uiButtonVariant,
  };
};
