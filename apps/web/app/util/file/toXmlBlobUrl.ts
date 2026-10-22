// A blob url holds the file's text without a request the dev server would transform. Phaser passes it through unchanged
// And loads it with a real XHR, where a data url is decoded as base64 and its XHR is dropped
export const toXmlBlobUrl = (text: string) => URL.createObjectURL(new Blob([text], { type: "application/xml" }));
