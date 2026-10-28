# GitHub Stats Card

A small, self-hosted GitHub profile card. The `/api` endpoint fetches a user's public GitHub contribution data and renders it as an SVG, ready to embed in a profile README.

## Use the card

After deploying this repository to Vercel and configuring `GITHUB_TOKEN`, use:

```md
![GitHub stats](https://YOUR-VERCEL-DOMAIN/api?username=fukien)
```

The `year` parameter selects a calendar year. It defaults to the current UTC year:

```text
https://YOUR-VERCEL-DOMAIN/api?username=fukien&year=2025
```

The card shows the contribution total, commits, pull requests, issues, and reviews for that calendar year, plus public repositories owned by the account and follower counts. Contribution counts follow GitHub's public contribution data; they do not count every Git commit object. The ring grade is a card-specific activity scale, not a GitHub rating:

| Grade | Contributions in the selected year |
| --- | ---: |
| A+ | 1,500 or more |
| A | 1,000–1,499 |
| B | 500–999 |
| C | 250–499 |
| D | 100–249 |
| E | Under 100 |

## Deploy

1. Import this repository into Vercel.
2. Add `GITHUB_TOKEN` as a Production environment variable.
3. Deploy, then open `https://YOUR-VERCEL-DOMAIN/api?username=fukien` to view the SVG.
4. Add the image URL to your profile README.

See [build-guide.md](build-guide.md) for token guidance, local development, and detailed setup steps.

## Data and privacy

The endpoint only requests public profile and contribution data. Contributions in private or internal repositories are excluded. The token authenticates the API request and must be stored in Vercel's environment settings; never commit it or include it in an image URL.

Responses are cached at the CDN for one hour. GitHub may also cache images embedded in profile READMEs.
