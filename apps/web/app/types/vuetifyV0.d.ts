import type { Events } from "vue";

// Every `@vuetify/v0` component renders an `Atom`, which passes the attributes it is given to the element it renders,
// So a native listener on one reaches the DOM. Its props declare none, and under "fallthroughAttributes" the unknown
// Event check reads them, so a component rooted on one takes the DOM's listeners from here
type NativeListeners = { [K in keyof Events]?: (event: Events[K]) => void };

declare module "@vuetify/v0" {
  interface AtomProps extends NativeListeners {}
}

export {};
