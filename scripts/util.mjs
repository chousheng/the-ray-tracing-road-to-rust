import fs from "node:fs";

import { sync as globSync } from "glob";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";

import remarkConfig from "../.remarkrc.mjs";

export const getSortedMdxFilenames = () => {
  let mdxFilenames = globSync("pages/*-*.mdx");

  const parseChapterNo = (str) => {
    return parseInt(str.match(/[0-9]+/)[0], 10);
  };

  mdxFilenames.sort((a, b) => {
    return parseChapterNo(a) - parseChapterNo(b);
  });

  return mdxFilenames;
};

export const parseMdAstNodeMeta = (node) => {
  let m = node.meta?.match(/^filename="(\S+) \| ([^"]*)"(.*)$/);
  if (m) {
    return { filename: m[1], title: m[2], lang: node.lang };
  } else {
    return null;
  }
};

export const getMdxListingsByLang = () => {
  const extractCodeBlocksFromMdxFile = (filename, listingsByLang) => {
    const doc = fs.readFileSync(filename);

    const ast = unified().use(remarkParse).use(remarkConfig).parse(doc);

    visit(ast, "code", (node) => {
      if (node.meta == null) {
        return;
      }

      const ALLOW_LANGS = ["rust", "cpp"];
      if (ALLOW_LANGS.indexOf(node.lang) == -1) {
        return;
      }

      const listing = {};

      let meta = parseMdAstNodeMeta(node);

      if (meta) {
        listing.lang = node.lang;
        listing.filename = meta.filename;
        listing.title = meta.title;
        listing.code = node.value;
        if (!(listing.lang in listingsByLang)) {
          listingsByLang[listing.lang] = [];
        }
        listingsByLang[listing.lang].push(listing);
      } else {
        // console.log("Unknown listing title format: " + node.meta);
      }
    });
  };

  const mdxFilenames = getSortedMdxFilenames();

  let listingsByLang = {};
  for (let filename of mdxFilenames) {
    extractCodeBlocksFromMdxFile(filename, listingsByLang);
  }

  return listingsByLang;
};
