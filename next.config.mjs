import nextra from "nextra";
import smartypants from "remark-smartypants";

const withNextra = nextra({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.jsx",
  latex: true,
  mdxOptions: {
    remarkPlugins: [smartypants],
  },
  flexsearch: {
    codeblocks: false,
  },
  defaultShowCopyCode: true,
  //codeHighlight: false,
});

const nextConfig = {
  //images: {
  //  unoptimized: true,
  //},
  //experimental: {
  //  appDir: false,
  //},
};

export default withNextra(nextConfig);
