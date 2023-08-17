import { Fig, Img } from "components/Image";
import { Tab, Tabs } from "components/Tabs";
import { Callout } from "nextra/components";

const config = {
  logo: <span>The Ray Tracing Road to Rust 🦀</span>,
  project: {
    link: "https://github.com/chousheng/raytracing-cpp-rust",
  },
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
};

export default config;
