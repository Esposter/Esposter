import type { WholeScreenImage } from "#src/models/genshinParity/WholeScreenImage";

// One line an image, `<width>x<height> <File:title> <url>`, or the article's title with no whole-screen image beside it
export const formatWholeScreenLines = (articleTitle: string, images: WholeScreenImage[]): string[] =>
  images.length === 0
    ? [`${articleTitle}: no whole-screen image`]
    : images.map(({ height, title, url, width }) => `${width}x${height} ${title} ${url}`);
