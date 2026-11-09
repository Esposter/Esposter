# Custom Device Sizes

Adding a device width of the author's own to the device toggle, beyond the fixed set. It covers the email row "Custom device sizes" and the webpage row "Custom device sizes". GrapesJS takes any device through its device manager's add call, and both of our editors offer three fixed widths.

## Why deferred

The email offers three fixed devices, defined in `apps/web/shared/models/pageBuilder/PageBuilderDevice.ts`. An email stores no breakpoint, so a custom width would change only the canvas and the preview frame. The webpage has three breakpoints, base, tablet and mobile, and every node's style is keyed by them ([style panel](../../../specs/resource/page-builder/style-panel/design.md)). A breakpoint beyond those three would add a key to every node's style, and the cascade would need a place for it, which is a model change rather than a toggle.

**Revisit when:** an email must be checked at a client width outside its three devices, or a webpage needs a breakpoint beyond its three.
