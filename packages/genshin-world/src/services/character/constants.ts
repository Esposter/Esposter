// A pack's own files, named alike in every pack: its model, uploaded under this name, and the terms bundled with it.
// The model's textures keep the paths the model names them by
export const CHARACTER_MODEL_PATH = "model.pmx";
export const CHARACTER_TERMS_PATH = "terms.txt";
// A pack's terms are fetched on its own, and abandoned past this so a stalled request cannot hold the page's text back
export const CHARACTER_TERMS_FETCH_TIMEOUT_MS = 10_000;
// A model and each of its textures run to megabytes, and are abandoned past this so a stalled request cannot leave a
// Character loading for good
export const CHARACTER_MODEL_FETCH_TIMEOUT_MS = 60_000;
