// Ported from the `is-mobile` package's default (non-tablet) detection.
// Groups are non-capturing since we only ever `.test()` against the user agent.
export const MOBILE_REGEX =
  /(?:android|bb\d+|meego).+mobile|armv7l|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(?:hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(?:ob|in)i|palm(?: os)?|phone|p(?:ixi|re)\/|plucker|pocket|psp|redmi|series[46]0|samsungbrowser.*mobile|symbian|treo|up\.(?:browser|link)|vodafone|wap|windows (?:ce|phone)|xda|xiino/iu;
// Chrome OS reports a mobile-looking user agent but is not a mobile device.
export const NOT_MOBILE_REGEX = /CrOS/u;
