# @esposter/xml2js

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

Inspired by [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js).
A complete rewrite from coffeescript to typescript that removes unnecessary dependencies like `events` to resolve many dependency issues e.g. [`this.removeAllListeners is not a function`](https://github.com/Leonidas-from-XIV/node-xml2js/issues/697).
The package aims to retain all the options and behaviour by `xml2js` but it is recommended to only use `parseStringPromise` as the sole option for parsing.

### Table of Contents

- ⚖️ [License](#license)

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/@esposter/xml2js/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/@esposter/xml2js/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/@esposter/xml2js/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/@esposter/xml2js.svg
