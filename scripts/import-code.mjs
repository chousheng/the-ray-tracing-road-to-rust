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

    const show = await git.show(log.hash, ["--unified=0", "--patience"]);
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
        let diffRange = { start1: 0, count1: 1, start2: 0, count2: 1 };

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
    let code = await git.show(log.hash + ":" + commit.filename);
    if (code.slice(-1) == "\n") {
      code = code.slice(0, -1); // Trim the last newline
    }
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

            // Replace code
            if (node.value != commit.code) {
              console.log("Replacing code: " + commit.message);
              node.value = commit.code;
            }

            let l = 1;
            let lineMap = new Map(commit.code.split("\n").map((e) => [l++, e]));

            // Modify the highlight string in mdx node meta
            //console.log(commit.diffRanges);
            const MODIFY_HIGHLIGHT_META = true;
            const PREFER_NEWLINE_UPFRONT = true;
            if (MODIFY_HIGHLIGHT_META) {
              // Build highlight string
              let hiStr = "{";

              let first = true;
              for (const diffRange of commit.diffRanges) {
                if (diffRange.count2 == 0) {
                  continue;
                }

                if (first) {
                  first = false;
                } else {
                  hiStr += ",";
                }

                if (diffRange.count2 == 1) {
                  hiStr += diffRange.start2.toString();
                } else {
                  let hiStart = diffRange.start2;
                  let hiEnd = diffRange.start2 + diffRange.count2 - 1;
                  if (PREFER_NEWLINE_UPFRONT) {
                    // Check if possible to shift the range
                    if (
                      lineMap.get(hiEnd) == "" &&
                      hiStart != 1 &&
                      lineMap.get(hiStart - 1) == ""
                    ) {
                      hiStart -= 1;
                      hiEnd -= 1;
                    }
                  }
                  hiStr += hiStart.toString();
                  hiStr += "-";
                  hiStr += hiEnd.toString();
                }
              }

              hiStr += "}";

              //console.log(hiStr);

              // Replace the original string
              const updateHiStrInMdxNodeMeta = (hiStr, node) => {
                let regex = /{.*}/;
                let meta = node.meta;
                if (meta.match(regex)) {
                  meta = meta.replace(regex, hiStr);
                } else {
                  meta = meta.trimEnd();
                  meta += " " + hiStr;
                  console.log(meta);
                }

                if (meta != node.meta) {
                  console.log("old meta: ", node.meta);
                  console.log("new meta: ", meta);
                  node.meta = meta;
                }
              };

              updateHiStrInMdxNodeMeta(hiStr, node);
            }
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
