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

export default withNextra();
