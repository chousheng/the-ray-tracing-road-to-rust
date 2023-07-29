import remarkMath from "remark-math";
import remarkMdx from "remark-mdx";

const remarkConfig = {
  settings: {
    // bullet: '*', // Use `*` for list item bullets (default)
    // See <https://github.com/remarkjs/remark/tree/main/packages/remark-stringify> for more options.
  },
  plugins: [
    //remarkPresetLintConsistent, // Check that markdown is consistent.
    //remarkPresetLintRecommended, // Few recommended rules.
    // Generate a table of contents in `## Contents`
    //[remarkToc, {heading: 'contents'}]
    remarkMath,
    remarkMdx,
  ],
};

export default remarkConfig;
