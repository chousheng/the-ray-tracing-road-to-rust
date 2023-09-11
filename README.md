# The Ray Tracing Road to Rust

This is the repository for the website: [The Ray Tracing Road to Rust](https://the-ray-tracing-road-to-rust.vercel.app/), a tutorial to help people learn Rust by building a ray tracer and comparing Rust with C++ using tabs interactively.

The tutorial is adapted from the awesome book: [Ray Tracing in One Weekend](https://raytracing.github.io/v3/books/RayTracingInOneWeekend.html) by Peter Shirley, Trevor David Black, and Steve Hollasch.

The website is built with Nextra, Next.js, TypeScript, React, Tailwind CSS, Remark, and MDX.

## Prerequisites

*   Node.js 18
*   Git

## Development setup

### Installing pnpm

Using Node.js's built-in pnpm:

```
corepack enable pnpm
```

Or installing pnpm as a global package:

```
npm install -g pnpm
```

### Installing packages

```
pnpm install
```

## Starting the development server

```
pnpm dev
```

## Exporting the tutorial code into git repositories

### Initializing project templates

```
git submodule update --init --recursive
```

This will download the project starter templates in the `templates` folder.

### Exporting code

```
pnpm run export
```

This will export code from the tutorial to `code/rust` and `code/cpp` git repositories with full change history.

### Exporting tutorial code and generating images

Generate images (small images only):

```
pnpm run export --gen-image
```

Generate all images:

```
pnpm run export --gen-large-image
```

# License

The .mdx files in the pages folder are licensed under the [CC0](LICENSE-CC0) license, and the rest of this project is licensed under the [MIT](LICENSE-MIT) license.
