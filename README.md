# Orbitae Template App

Welcome to your first IPFS ready DApp template!

This template features:

- Typescript
- Next.js
- Tailwind
- Headless UI

## Getting Started

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

## Deploy on IPFS

When you're ready to deploy, build the app and generate the output:

```bash
yarn build && yarn export
```

Load the `out` folder into IPFS using the IPFS desktop app. Once you've got the folder CID, you can access it through:

- `https://gateway.ipfs.io/ipfs/<CID>/`
- `https://cloudflare-ipfs.com/ipfs/<CID>/`
