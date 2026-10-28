# Remaining steps

The card endpoint and setup documentation are in this repository. These steps remain before the card is live on the profile.

## Deploy the endpoint

- [ ] Create a GitHub token for public data only. Do not grant private-repository access or the optional `read:user` scope.
- [ ] Import `fukien/github-stats-card` into your Vercel account as a new project. For a personal, noncommercial card, the free Hobby plan should be suitable within its usage limits.
- [ ] Add the token as the `GITHUB_TOKEN` Production environment variable in Vercel, then deploy or redeploy.
- [ ] Open `https://YOUR-VERCEL-DOMAIN/api?username=fukien` and confirm it returns an SVG with the expected public counts. Also check a past year with `&year=2025`.
- [ ] If the endpoint returns plain-text error output, check the Vercel function logs and confirm the Production environment has `GITHUB_TOKEN`.
- [ ] Replace `YOUR-VERCEL-DOMAIN` in the docs with the final deployment domain.

## Switch the profile README

- [ ] In the separate `fukien/fukien` profile repository, replace the GitHub Stats image URL that currently uses `github-readme-stats-one-bice.vercel.app/api` with the new `/api?username=fukien` URL.
- [ ] Keep the existing Top Languages and streak cards unless you are separately replacing those services; this project currently provides only the GitHub Stats card.
- [ ] Push the profile README change and confirm the new card renders after GitHub's image cache refreshes.
- [ ] Check whether the profile repository has an old workflow or committed SVG for this stats card. Remove it only after confirming the live card works and it is no longer referenced.

## Notes

- `github-readme-stats-one-bice.vercel.app` is the existing stats service. Its owner's Vercel plan is not publicly visible. The deployment above will be a separate app under your own Vercel account.
- Keep the token in Vercel's environment settings. Do not commit it or include it in the profile image URL.
- See [build-guide.md](build-guide.md) for detailed token, deployment, and local-development instructions.
