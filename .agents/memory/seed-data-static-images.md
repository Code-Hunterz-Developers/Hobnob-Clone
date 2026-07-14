---
name: Seed data product images
description: How to make generateImage output usable as real HTTP-served imageUrl values for DB-seeded rows in a react-vite artifact.
---

When seeding a database table that stores an `imageUrl` (e.g. products, categories) for a react-vite artifact, generated images placed under `attached_assets/generated_images/` are NOT served over HTTP by the artifact's dev/prod server — they're only usable via build-time `@assets` import aliases in frontend code, not as arbitrary runtime URL strings coming back from an API response.

**Why:** The artifact's static file serving (dev Vite server and production static build) only serves files under the artifact's own `public/` directory (or bundled assets), not the shared `attached_assets/` directory.

**How to apply:** After generating images with `generateImage`, copy them into `artifacts/<artifact-dir>/public/images/` and store DB `imageUrl` values as root-relative paths like `/images/foo.jpg` (works when the artifact's `previewPath`/`BASE_PATH` is `/`; otherwise prefix with the base path). Confirm the artifact's `BASE_PATH` in its `artifact.toml` before deciding the URL prefix.
