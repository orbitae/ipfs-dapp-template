# Orbitae Template App

Welcome to your first IPFS ready DApp template!

This template features:

- Typescript
- Next.js
- Tailwind

## Getting Started

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

## Deploy on IPFS

This project uses `ipfs-deploy` which by default deploys using Infura's services. To set this up create an infura IPFS project and create your `.env` file based on the `.env.origin`. 

When you're ready to deploy, run:

```bash
yarn deploy
```

This command will build, export and deploy your project. Copy the CID from the console and access it through the IPFS gateway of your choice:

- `https://gateway.ipfs.io/ipfs/<CID>/`
- `https://cloudflare-ipfs.com/ipfs/<CID>/`

Although it might take a while for your content to be indexed by these, if you would like to instantly access it I recommend using the Infura's dedicated gateway with your own subdomain. More info about this [here](https://docs.infura.io/infura/networks/ipfs/how-to/access-ipfs-content/dedicated-gateways#choose-a-unique-subdomain).

You can take a look at this template right [here](https://orbitae.infura-ipfs.io/ipfs/Qmf6eW87QP4o5p6WTEsp5sP4vZdbUBqJpqyWSvCAZEenyC/)!
