import NextImage from "next/image";

type ImgProps = {
  caption: string;
  src: string;
};

export const Img = ({ caption, src }: ImgProps) => {
  return (
    <figure className="mt-6 first:mt-0 flex flex-col items-center justify-center">
      <NextImage src={require("../images/" + src)} alt={caption} />
      <figcaption className="text-sm text-neutral-600 dark:text-neutral-400">
        {caption}
      </figcaption>
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
      <NextImage src={require("../images/" + src)} alt={caption} />
      <figcaption className="text-sm text-neutral-600 dark:text-neutral-400">
        {caption}
      </figcaption>
    </figure>
  );
};
