import fs from "node:fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { visit } from "unist-util-visit";

import { simpleGit } from "simple-git";

import remarkConfig from "../.remarkrc.mjs";
import {
  getMdxListingsByLang,
  getSortedMdxFilenames,
  parseMdAstNodeMeta,
} from "./util.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getGitCommits = async (gitRepoPath) => {
  const git = simpleGit(gitRepoPath);
  const logEntries = (await git.log()).all.reverse();

  let commits = [];

  for (const log of logEntries) {
    let commit = {
      message: "",
      hash: log.hash,
      filename: null,
      diffRanges: [],
      code: null,
    };

    // Parse message
    const m = log.message.match(/^Listing: (.*)/);
    if (!m) {
      continue;
    }
    commit.message = m[1];

    const show = await git.show(log.hash, ["--unified=0"]);
    let lines = show.split("\n");
    for (let line of lines) {
      // Parse filename
      let m = line.match(/^diff --git a\/\S+ b\/(\S+)/);
      if (m) {
        if (commit.filename) {
          console.log("Error: more than one file found in a listing commit");
          console.log(" message:", commit.message);
          console.log(" hash:", commit.hash);
          console.log(" file 1:", commit.filename);
          console.log(" file 2:", m[1]);
          //process.exit();
        } else {
          commit.filename = m[1];
        }
      }

      // Parse diffRanges
      m = line.match(/\@\@\s\-(\S+)\s+\+(\S+)\s+\@\@/);
      if (m) {
        let diffRange = { start1: 0, count1: 1, start2: 0, start2: 1 };

        if (m[1].includes(",")) {
          let tokens = m[1].split(",");
          diffRange.start1 = parseInt(tokens[0]);
          diffRange.count1 = parseInt(tokens[1]);
        } else {
          diffRange.start1 = parseInt(m[1]);
        }

        if (m[2].includes(",")) {
          let tokens = m[2].split(",");
          diffRange.start2 = parseInt(tokens[0]);
          diffRange.count2 = parseInt(tokens[1]);
        } else {
          diffRange.start2 = parseInt(m[2]);
        }

        commit.diffRanges.push(diffRange);
      }
    }

    // Parse code
    const code = await git.show(log.hash + ":" + commit.filename);
    commit.code = code;

    // Add parsed commit
    commits.push(commit);
  }

  //console.log(commits);

  return commits;
};

const importCodeFromGitToMdx = async (importSpecs) => {
  const mdxListingsByLang = getMdxListingsByLang();

  for (const importSpec of importSpecs) {
    const m = importSpec.match(/([^:]+):([^:]+)/);
    if (!m) {
      continue;
    }

    const lang = m[1];
    const gitRepoPath = m[2];

    console.log("Lang:", lang);
    console.log("Path:", gitRepoPath);

    const gitCommits = await getGitCommits(gitRepoPath);

    const titleToGitCommit = {};
    for (const commit of gitCommits) {
      titleToGitCommit[commit.message] = commit;
    }

    const titleToMdxListing = {};
    for (const listing of mdxListingsByLang[lang]) {
      titleToMdxListing[listing.title] = listing;
    }

    //
    // Checking missing code
    //

    let hasError = false;

    for (const title in titleToGitCommit) {
      if (!(title in titleToMdxListing)) {
        console.log("Error: mdx missing:", title);
        hasError = true;
      }
    }

    for (const title in titleToMdxListing) {
      if (!(title in titleToGitCommit)) {
        console.log("Error: git missing:", title);
        hasError = true;
      }
    }

    //
    // Find inconsistent filenames
    //

    for (const title in titleToGitCommit) {
      if (title in titleToMdxListing) {
        const gitCommit = titleToGitCommit[title];
        const mdxListing = titleToMdxListing[title];

        if (gitCommit.filename != "src/" + mdxListing.filename) {
          console.log(
            "Error: inconsistent filename:",
            "git=" + gitCommit.filename,
            "mdx=" + mdxListing.filename,
          );
          hasError = true;
        }
      }
    }

    if (hasError) {
      console.log("Error: aborting because of errors");
      return;
    }

    //
    // Import code and write files
    //
    const mdxFilenames = getSortedMdxFilenames();

    for (const filename of mdxFilenames) {
      const doc = fs.readFileSync(filename);

      const plugin = () => (mdast) => {
        visit(mdast, "code", (node) => {
          const meta = parseMdAstNodeMeta(node);
          if (meta?.title in titleToGitCommit && meta.lang == lang) {
            const commit = titleToGitCommit[meta.title];
            console.log("Replacing: " + commit.message);
            node.value = commit.code;
          }
        });
      };

      const file = unified()
        .use(remarkParse)
        .use(remarkConfig)
        .use(plugin)
        .use(remarkStringify)
        .processSync(doc);

      //console.log(String(file));
      fs.writeFileSync(filename, String(file));
    }

    console.log("Done!");
  }
};

const main = async () => {
  const importSpecs = [];

  importSpecs.push("rust" + ":" + __dirname + "/../../ray-tracing-impl-rust");
  importSpecs.push("cpp" + ":" + __dirname + "/../../ray-tracing-impl-cpp");

  await importCodeFromGitToMdx(importSpecs);
};

main();
