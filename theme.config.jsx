import { Fig, Img } from "components/Image";
import { Tab, Tabs } from "components/Tabs";
import { useRouter } from "next/router";
import { Callout } from "nextra/components";

const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? "https://" + process.env.NEXT_PUBLIC_VERCEL_URL
  : "http://localhost:3000";

const title = "The Ray Tracing Road to Rust";
const titleWithEmoji = "The Ray Tracing Road to Rust 🦀";
const description = "A tutorial to learn Rust by writing a ray tracer.";
const ogImage = baseUrl + "/og.jpg";

const config = {
  logo: <span>{titleWithEmoji}</span>,
  useNextSeoProps: () => {
    const { asPath } = useRouter();

    return {
      titleTemplate: asPath === "/" ? title : `%s - ${title}`,
      description: description,
      openGraph: {
        type: "website",
        title: titleWithEmoji,
        images: [{ url: ogImage }],
      },
      twitter: {
        cardType: "summary_large_image",
      },
    };

    if (asPath === "/") {
      return {
        titleTemplate: title,
      };
    } else {
      return {
        titleTemplate: `%s – ${title}`,
      };
    }
  },
  head: () => {
    return (
      <>
        {/* <meta httpEquiv="Content-Language" content="en" />
        <meta name="apple-mobile-web-app-title" content={title} />
        <meta name="msapplication-TileColor" content="#fff" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} /> */}
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
