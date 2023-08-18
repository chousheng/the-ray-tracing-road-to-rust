import nextra from "nextra";
import smartypants from "remark-smartypants";

const withNextra = nextra({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.jsx",
  latex: true,
  mdxOptions: {
    remarkPlugins: [smartypants],
  },
});

const nextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    appDir: false,
  },
};

export default withNextra(nextConfig);
