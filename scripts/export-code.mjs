import fs from "node:fs";

import { simpleGit } from "simple-git";

import { getMdxListingsByLang } from "./util.mjs";

const exportCodeFromMdxToGit = async () => {
  let listingsByLang = getMdxListingsByLang();

  const EXPORT_FOLDER = "code";

  for (let lang in listingsByLang) {
    const base = EXPORT_FOLDER + "/" + lang;

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
  await exportCodeFromMdxToGit();
};

main();
