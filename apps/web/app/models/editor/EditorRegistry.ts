import type { Component } from "vue";

// What fills each panel: the component an editor draws for each content key its layout names. The layout check reports a
// Key with no entry here, so nothing is drawn for it
export type EditorRegistry = Record<string, Component>;
