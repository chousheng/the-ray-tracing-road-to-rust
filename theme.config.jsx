import { Fig, Img } from "components/Image";
import { Tab, Tabs } from "components/Tabs";
import { useRouter } from "next/router";
import { useConfig } from "nextra-theme-docs";
import { Callout } from "nextra/components";

const websiteTitle = "The Ray Tracing Road to Rust";
const websiteTitleWithEmoji = "The Ray Tracing Road to Rust 🦀";
const description = "A tutorial to learn Rust by writing a ray tracer.";

let baseUrl = "http://localhost:3000";
const m = process.env.NEXT_PUBLIC_VERCEL_URL?.match(
  /(.*)-(.{9})-(.*).vercel.app/,
);
if (m) {
  baseUrl = "https://" + m[1] + ".vercel.app";
}

const ogImage = baseUrl + "/og.jpg";

const config = {
  logo: <span>{websiteTitleWithEmoji}</span>,
  useNextSeoProps: () => {
    const { asPath } = useRouter();
    const { title } = useConfig();
    return {
      title: asPath === "/" ? websiteTitle : title + " - " + websiteTitle,
      description: description,
      openGraph: {
        title:
          asPath === "/"
            ? websiteTitleWithEmoji
            : title + " - " + websiteTitleWithEmoji,
        images: [{ url: ogImage }],
      },
      twitter: {
        cardType: "summary_large_image",
      },
    };
  },
  head: () => {
    return (
      <>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="apple-mobile-web-app-title" content={websiteTitle} />
        <meta name="msapplication-TileColor" content="#fff" />
        <meta httpEquiv="Content-Language" content="en" />
      </>
    );
  },
  project: {
    link: "https://github.com/chousheng/the-ray-tracing-road-to-rust",
  },
  docsRepositoryBase:
    "https://github.com/chousheng/the-ray-tracing-road-to-rust/tree/main",
  components: {
    Callout: Callout,
    Tabs: Tabs,
    Tab: Tab,
    Fig: Fig,
    Img: Img,
  },
  footer: {
    component: null,
  },
  gitTimestamp: null,
  feedback: {
    content: "Give us feedback",
  },
};

export default config;
