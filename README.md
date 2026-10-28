# Set up a live GitHub stats card

This guide replaces the stats SVG generated in this repository with a card served by your own endpoint. The endpoint generates the SVG when requested, keeps the original card design, and reads current public GitHub stats.

## Cost

For a personal profile card, Vercel's Hobby plan should be enough and costs $0. No custom domain is needed; use the Vercel URL. Stay within the current free-plan limits. GitHub tokens are free.

## What you will have

- A small GitHub repository containing the card endpoint.
- A Vercel deployment that returns an SVG at a URL like `https://your-project.vercel.app/api?username=fukien`.
- A profile README that displays that URL instead of a committed SVG file.
- Public contribution counts calculated from GitHub's contribution data, following GitHub's contribution rules.

## Steps

### 1. Create a repository for the card service

Create a separate GitHub repository, for example `fukien/github-stats-card`. Keep the service separate from the profile README repository. The code can be public; do not put a token or other secret in it.

### 2. Implement the SVG endpoint

Add an API route, such as `/api`, that:

1. Accepts `username=fukien`.
2. Queries GitHub's GraphQL API for the public contribution data and other card metrics.
3. Renders an SVG matching the earlier card: title, icons, stat rows, and A+ progress ring.
4. Returns it with the `image/svg+xml` content type and a short cache lifetime, such as one hour.

The commit figure should be defined as GitHub-recognized public commit contributions. It is not a count of every Git commit object in all repositories. Do not request the optional `read:user` scope if the card should exclude private contributions. GitHub documents that this scope is needed to include private and internal contributions in GraphQL contribution collections.

### 3. Create a GitHub API token

Create a token for the endpoint to authenticate its GraphQL requests. Configure it for public data only; do not grant private repository access or the `read:user` scope for this public-only card. Never commit the token or put it in the README URL.

GitHub API and token requirements can change. If the endpoint gets an authentication or permission error, adjust the token to the minimum permission required for public profile data.

### 4. Deploy the service on Vercel

1. Sign in to Vercel and import the `github-stats-card` repository.
2. Add the token in the Vercel project's **Settings → Environment Variables**, for the Production environment. For example, name it `GITHUB_TOKEN`.
3. Deploy the project.
4. If you add or change the environment variable after deployment, redeploy so the function receives it.

Keep the token only in Vercel's environment settings. Vercel makes project environment variables available to deployed functions and does not require them to be stored in the source repository.

### 5. Check the live card URL

Open the deployed API URL in a browser:

```text
https://your-project.vercel.app/api?username=fukien
```

Confirm that it returns an SVG, the public counts look right, and the icons and A+ ring match the earlier design. Also check that an API error does not return a broken or misleading card.

### 6. Point the profile README at the endpoint

In the `fukien/fukien` profile repository, replace the local stats image reference with the deployed URL:

```md
![GitHub stats](https://your-project.vercel.app/api?username=fukien)
```

Commit and push the README change, then check the profile page. GitHub and the endpoint may cache the image, so a fresh stat may take up to the configured cache period to appear.

### 7. Remove the scheduled image workflow after the live card works

Once the profile page displays the live endpoint correctly, remove the workflow that regenerates `assets/github-stats-v2.svg` and update any remaining README references to that local file. This avoids maintaining both a generated snapshot and a live card.

## Ongoing updates

Vercel deploys new endpoint code when changes are pushed to its connected repository. New GitHub activity is fetched when the image endpoint is requested, subject to its cache lifetime and GitHub's processing of contributions. You will not need a daily workflow to regenerate the image.

## References

- [Vercel pricing](https://vercel.com/pricing)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [GitHub GraphQL contribution fields](https://docs.github.com/en/graphql/reference/users)
- [GitHub personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
