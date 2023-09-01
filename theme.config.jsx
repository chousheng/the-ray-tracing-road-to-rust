import { Fig, Img } from "components/Image";
import { Tab, Tabs } from "components/Tabs";
import { Callout } from "nextra/components";

const config = {
  logo: <span>The Ray Tracing Road to Rust 🦀</span>,
  useNextSeoProps: () => {
    return {
      titleTemplate: "%s – The Ray Tracing Road to Rust 🦀",
    };
  },
  head: () => {
    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
      ? "https://" + process.env.NEXT_PUBLIC_VERCEL_URL
      : "http://localhost:3000";

    const appTitle = "The Ray Tracing Road to Rust";
    const description = "A tutorial to learn Rust by writing a ray tracer.";
    const ogImage = baseUrl + "/og.jpg";

    return (
      <>
        <meta httpEquiv="Content-Language" content="en" />
        <meta name="apple-mobile-web-app-title" content={appTitle} />
        <meta name="msapplication-TileColor" content="#fff" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
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
