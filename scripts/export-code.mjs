import fs from "node:fs";

import { simpleGit } from "simple-git";

import { getMdxListingsByLang } from "./util.mjs";

const exportCodeFromMdxToGit = async () => {
  let listingsByLang = getMdxListingsByLang();

  const EXPORT_FOLDER = "code";

  fs.rmSync(EXPORT_FOLDER, { recursive: true, force: true });
  fs.mkdirSync(EXPORT_FOLDER, { recursive: true }, () => {});

  const starterRepoPathByLang = {
    rust: "https://github.com/chousheng/ray-tracing-starter-rust.git",
    cpp: "https://github.com/chousheng/ray-tracing-starter-cpp.git",
  };

  for (let lang in listingsByLang) {
    let git = simpleGit(EXPORT_FOLDER);
    await git.clone(starterRepoPathByLang[lang], lang);

    const base = EXPORT_FOLDER + "/" + lang;
    git = simpleGit(base);

    fs.rmSync(base + "/.git", { recursive: true, force: true });

    await git.init();
    await git.add(".").commit("Initial commit");

    for (const listing of listingsByLang[lang]) {
      fs.writeFileSync(
        base + "/src/" + listing.filename,
        listing.code + "\n",
        () => {},
      );
      await git.add(".").commit(`Listing: ${listing.title}`);
    }
  }
};

const main = async () => {
  await exportCodeFromMdxToGit();
};

main();
