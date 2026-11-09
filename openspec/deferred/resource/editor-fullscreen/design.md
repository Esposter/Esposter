# Editor Fullscreen

An in-app control that gives the page builder the whole window with its chrome hidden. It covers the email row "Fullscreen editor" and the webpage row "Fullscreen editor". GrapesJS has a fullscreen command in its top bar, and neither of our editors has one.

## Why deferred

The browser's own full-screen mode already gives the editor the whole window, and the editor shell names no full-window layout to hold an in-app one ([editor shell](../../../specs/resource/editor-shell/design.md)). No owner has asked for it, so an in-app control would be a second way to reach what the browser already offers.

**Revisit when:** an owner asks for in-app full-window editing that the browser's full-screen mode does not give.
