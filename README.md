# The Ray Tracing Road to Rust

This is the repository for the website: The Ray Tracing Road to Rust, a Rust tutorial to help people learn Rust though an interesting ray tracing project and compare Rust with C++ interactively.

The website is built with Nextra, Next.js, TypeScript, React, Tailwind CSS, Remark, and MDX.

## Development

Prerequisites:

- Node.js 18
- pnpm
- Turbopack (optional)

Install packages:

```
pnpm install
```

Start development server to live reload when editing pages/*.mdx files:

```
pnpm next
```

If `packages/*` need to be modified, use Turbopack to rebuild the packages and do the live reloading:

```
turbo dev
```
