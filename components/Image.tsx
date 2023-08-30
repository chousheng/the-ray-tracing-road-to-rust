import NextImage from "next/image";
import { CSSProperties } from "react";

type ImgProps = {
  caption: string;
  src: string;
  style: CSSProperties;
};

export const Img = ({ caption, src, style }: ImgProps) => {
  const isPNG = src.includes(".png");
  return (
    <figure className="mt-6 first:mt-0 flex flex-col items-center justify-center">
      <NextImage
        src={require("../images/" + src)}
        alt={caption}
        style={{ ...(isPNG && { imageRendering: "pixelated" }), ...style }}
        sizes="100vw"
        placeholder="blur"
        unoptimized={isPNG}
        quality={95}
      />
      <figcaption className="mt-1 text-sm">{caption}</figcaption>
    </figure>
  );
};

type FigProps = {
  caption: string;
  src: string;
  label: string;
};

export const Fig = ({ caption, src }: FigProps) => {
  return (
    <figure className="mt-6 first:mt-0 flex flex-col items-center justify-center">
      <NextImage
        src={require("../images/" + src)}
        alt={caption}
        style={{
          width: "600px",
        }}
        sizes="100vw"
        placeholder="blur"
      />
      <figcaption className="mt-1 text-sm">{caption}</figcaption>
    </figure>
  );
};
