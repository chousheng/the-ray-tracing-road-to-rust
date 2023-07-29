import { sync as globSync } from "glob";
import fs from "node:fs";

import remarkParse from "remark-parse";
import { unified } from "unified";
import { inspect } from "unist-util-inspect";
import { visitParents } from "unist-util-visit-parents";

import { simpleGit } from "simple-git";

import remarkConfig from "../.remarkrc.mjs";

const getSortedMdxFilenames = () => {
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

const extractCodeBlocksFromMdxFile = (filename, listingsByLang) => {
  const doc = fs.readFileSync(filename);

  const ast = unified().use(remarkParse).use(remarkConfig).parse(doc);

  visitParents(ast, "code", (node, parents) => {
    if (node.meta == null) {
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

export const getMdxListingsByLang = () => {
  const mdxFilenames = getSortedMdxFilenames();

  let listingsByLang = {};
  for (let filename of mdxFilenames) {
    extractCodeBlocksFromMdxFile(filename, listingsByLang);
  }

  return listingsByLang;
};

const exportCodeFromMdxToGit = async () => {
  let listingsByLang = getMdxListingsByLang();

  const exportFolder = "code";

  for (let lang in listingsByLang) {
    const base = exportFolder + "/" + lang;

    fs.mkdirSync(base, { recursive: true }, () => {});

    const git = simpleGit(base);

    await git.init();

    for (const listing of listingsByLang[lang]) {
      fs.writeFileSync(base + "/" + listing.filename, listing.code, () => {});

      await git.add(".").commit(listing.title);
    }
  }
};

const main = async () => {
  //await exportCodeFromMdxToGit();
};

main();
