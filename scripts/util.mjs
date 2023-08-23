import fs from "node:fs";

import { sync as globSync } from "glob";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";

import remarkConfig from "../.remarkrc.mjs";

export const getSortedMdxFilenames = () => {
  let mdxFilenames = globSync("pages/**/*-*.mdx");

  // Use "natural" sort
  mdxFilenames = mdxFilenames.sort(function (a, b) {
    return a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });

  return mdxFilenames;
};

export const parseMdAstNodeMeta = (node) => {
  let meta = {
    lang: node.lang,
    filename: "",
    title: "",
    addCargoDep: "",
    genImage: false,
  };

  if (!node.meta) {
    return meta;
  }

  let m = node.meta.match(/^filename="(\S+) \| ([^"]*)"(.*)$/);
  if (m) {
    meta.filename = m[1];
    meta.title = m[2];
  }

  let addCargoDep = node.meta.match(/addCargoDep="([^"]*)"/);
  if (addCargoDep) {
    meta.addCargoDep = addCargoDep[1];
  }

  let genImage = node.meta.match(/(^|\s)genImage(\s|$)/);
  if (genImage) {
    meta.genImage = true;
  }

  return meta;
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

      if (meta.title) {
        listing.lang = node.lang;
        listing.filename = meta.filename;
        listing.title = meta.title;
        listing.addCargoDep = meta.addCargoDep;
        listing.genImage = meta.genImage;
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
