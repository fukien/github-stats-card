# Deployment and setup

This repository is a small Node.js serverless function for Vercel. It has no runtime dependencies. The implementation lives in [`api/index.js`](api/index.js) and serves the SVG at `/api`.

## 1. Create a GitHub token

The endpoint uses GitHub's GraphQL API, which requires authentication. Create a token for reading public GitHub data. Do not grant access to private repositories or the optional `read:user` scope; private and internal contributions should stay excluded from this card. GitHub documents that those restricted contributions are only included when `read:user` is granted ([contribution collection docs](https://docs.github.com/en/graphql/reference/users)).

Keep the token secret. It must not be committed, placed in the image URL, or included in client-side code.

## 2. Deploy to Vercel

1. Sign in to Vercel and import `fukien/github-stats-card`.
2. In the Vercel project, open **Settings → Environment Variables**.
3. Add `GITHUB_TOKEN` with the token value for the **Production** environment.
4. Deploy or redeploy so the function receives the environment variable.

Vercel serves the function at `/api` based on the `api/index.js` file. No build command or output directory is needed.

## 3. Check the endpoint

Open this URL, replacing the host with the Vercel deployment domain:

```text
https://YOUR-VERCEL-DOMAIN/api?username=fukien
```

It should return an SVG. You can request another public GitHub account or a past calendar year:

```text
https://YOUR-VERCEL-DOMAIN/api?username=octocat&year=2025
```

The endpoint accepts `GET` requests. `username` defaults to `fukien`; `year` defaults to the current UTC year and accepts 2008 through the current year. The card shows public contribution counts for the selected calendar year, public repositories owned by the account, and followers. Responses are cached for one hour at the CDN.

If the endpoint returns an error, check the Vercel function logs and confirm `GITHUB_TOKEN` is present in the Production environment. The function returns a plain-text error instead of a broken or misleading SVG.

## 4. Embed the card in your profile

In the `fukien/fukien` profile repository, point the stats image at the deployed URL:

```md
![GitHub stats](https://YOUR-VERCEL-DOMAIN/api?username=fukien)
```

Commit and push that README change. GitHub may cache the image after the endpoint's own one-hour cache expires.

## 5. Retire the old generated image workflow

Once the profile displays the live card correctly, remove the workflow that regenerates `assets/github-stats-v2.svg` from the profile repository and remove remaining references to that file. Keep the workflow until the live endpoint is deployed and verified.

## Local development

1. Copy `.env.example` to `.env.local` and set `GITHUB_TOKEN` to your token.
2. Run the Vercel development server with `npx vercel dev`.
3. Open `http://localhost:3000/api?username=fukien`.

Do not commit `.env.local`; it is ignored by Git.
