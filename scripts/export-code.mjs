import { execSync } from "node:child_process";
import fs from "node:fs";

import { simpleGit } from "simple-git";
import slugify from "slugify";

import { program } from "commander";

import { getMdxListingsByLang } from "./util.mjs";

program
  .option("--check-compile")
  .option("--gen-image")
  .option("--gen-large-image");
program.parse();

const opts = program.opts();

const exportCodeFromMdxToGit = async () => {
  let listingsByLang = getMdxListingsByLang();

  const EXPORT_FOLDER = "code";

  fs.rmSync(EXPORT_FOLDER, { recursive: true, force: true });
  fs.mkdirSync(EXPORT_FOLDER, { recursive: true }, () => {});

  const starterRepoPathByLang = {
    rust: "../../ray-tracing-starter-rust",
    cpp: "../../ray-tracing-starter-cpp",
  };

  const ADD_CARGO_DEP_AND_COMMIT = true;
  const WRITE_CODE = true;
  const FORMAT_CODE = true;
  const COMMIT_CODE = true;
  const ADD_SLUGIFY_IMAGE_TITLE = true;

  for (let lang in listingsByLang) {
    console.log(`[${lang}]`);
    let git = simpleGit(EXPORT_FOLDER);
    await git.clone(starterRepoPathByLang[lang], lang);

    const base = EXPORT_FOLDER + "/" + lang;
    git = simpleGit(base);

    fs.rmSync(base + "/.git", { recursive: true, force: true });

    await git.init();
    await git.add(".").commit("Initial commit");

    let i = 1;

    for (const listing of listingsByLang[lang]) {
      console.log(`- ${listing.title}`);

      if (ADD_CARGO_DEP_AND_COMMIT && listing.addCargoDep) {
        console.log(`Adding Cargo dependency: ${listing.addCargoDep}`);
        execSync(`cd ${base}; cargo add ${listing.addCargoDep}`);
        await git.add(".").commit(`Add ${listing.addCargoDep} to Cargo`);
      }

      if (WRITE_CODE) {
        fs.writeFileSync(
          base + "/src/" + listing.filename,
          listing.code + "\n",
          () => {},
        );
      }

      if (FORMAT_CODE) {
        if (lang == "rust") {
          execSync(`cd ${base}; cargo +nightly fmt`);
        } else if (lang == "cpp") {
          execSync(`cd ${base}; clang-format -i src/*`);
        }
      }

      if (COMMIT_CODE) {
        await git.add(".").commit(`Listing: ${listing.title}`);
      }

      if (
        (opts.checkCompile || opts.genImage || opts.genLargeImage) &&
        (listing.checkCompile || listing.genImage || listing.genLargeImage)
      ) {
        console.log(`Compiling`);
        if (lang == "rust") {
          execSync(`cd ${base}; cargo build --release`);
        } else if (lang == "cpp") {
          execSync(`cd ${base}; make clean; make build-release`);
        }
      }

      if (
        (opts.genImage && listing.genImage) ||
        (opts.genLargeImage && listing.genLargeImage)
      ) {
        let filename = `image${i}`;
        if (ADD_SLUGIFY_IMAGE_TITLE) {
          filename +=
            "-" + slugify(listing.title, { remove: /[*+~.()'"!:@]/g });
        }
        filename += ".ppm";

        console.log(`Generating image: ${filename}`);
        if (lang == "rust") {
          execSync(`cd ${base}; cargo run --release > ${filename}`);
        } else if (lang == "cpp") {
          execSync(`cd ${base}; make run-release > ${filename}`);
        }
        ++i;
      }
    }
  }
};

const main = async () => {
  await exportCodeFromMdxToGit();
};

main();
