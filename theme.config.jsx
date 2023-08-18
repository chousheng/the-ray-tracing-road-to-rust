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
  project: {
    link: "https://github.com/chousheng/theraytracingroadtorust",
  },
  docsRepositoryBase:
    "https://github.com/chousheng/theraytracingroadtorust/tree/main",
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
