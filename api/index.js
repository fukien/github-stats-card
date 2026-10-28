const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const CACHE_CONTROL = "public, s-maxage=3600, stale-while-revalidate=86400";

const QUERY = `
  query GitHubStatsCard($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      login
      name
      url
      repositories(privacy: PUBLIC, ownerAffiliations: OWNER) {
        totalCount
      }
      followers {
        totalCount
      }
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
        }
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
      }
    }
  }
`;

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function formatNumber(value) {
  return new Intl.NumberFormat("en").format(value);
}

function activityGrade(total) {
  if (total >= 1500) return "A+";
  if (total >= 1000) return "A";
  if (total >= 500) return "B";
  if (total >= 250) return "C";
  if (total >= 100) return "D";
  return "E";
}

function icon(type, x, y) {
  const paths = {
    contributions: '<path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.64 5.64l2.12 2.12m8.48 8.48 2.12 2.12m0-12.72-2.12 2.12m-8.48 8.48-2.12 2.12"/><circle cx="12" cy="12" r="5"/>',
    commits: '<path d="M7 7h10v10H7z"/><path d="M2 12h5m10 0h5"/>',
    pullRequests: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M6 8v8a2 2 0 0 0 2 2h8m-2-12h2a2 2 0 0 1 2 2v8"/><path d="m14 6 2-2 2 2"/>',
    issues: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5m0 3h.01"/>',
    reviews: '<path d="M4 5h16v12H9l-5 3z"/><path d="m8 11 2.5 2.5L16 8"/>',
  };
  return `<g transform="translate(${x} ${y})" fill="none" stroke="#91a7c5" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths[type]}</g>`;
}

function renderCard(user, year) {
  const collection = user.contributionsCollection;
  const total = collection.contributionCalendar.totalContributions;
  const grade = activityGrade(total);
  const circumference = 2 * Math.PI * 39;
  const progress = Math.min(total / 1500, 1);
  const offset = circumference * (1 - progress);
  const displayName = user.name || user.login;
  const metrics = [
    { label: "Contributions", value: total, icon: "contributions" },
    { label: "Commits", value: collection.totalCommitContributions, icon: "commits" },
    { label: "Pull requests", value: collection.totalPullRequestContributions, icon: "pullRequests" },
    { label: "Issues", value: collection.totalIssueContributions, icon: "issues" },
    { label: "Reviews", value: collection.totalPullRequestReviewContributions, icon: "reviews" },
  ];

  const metricRows = metrics.map((metric, index) => {
    const y = 99 + index * 34;
    return `${icon(metric.icon, 294, y - 10)}<text x="322" y="${y + 5}" class="label">${escapeXml(metric.label)}</text><text x="592" y="${y + 5}" class="value" text-anchor="end">${formatNumber(metric.value)}</text>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="660" height="280" viewBox="0 0 660 280" role="img" aria-labelledby="title description">
  <title id="title">GitHub stats for ${escapeXml(user.login)} in ${year}</title>
  <desc id="description">${formatNumber(total)} public contributions, including ${formatNumber(collection.totalCommitContributions)} commits, ${formatNumber(collection.totalPullRequestContributions)} pull requests, ${formatNumber(collection.totalIssueContributions)} issues, and ${formatNumber(collection.totalPullRequestReviewContributions)} reviews.</desc>
  <defs>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7aa2f7"/><stop offset="1" stop-color="#bb9af7"/></linearGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a2235"/><stop offset="1" stop-color="#151b2b"/></linearGradient>
    <style>
      text{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      .muted{fill:#8996ad}.label{fill:#aab6cb;font-size:13px}.value{fill:#f0f4fc;font-size:14px;font-weight:650}
    </style>
  </defs>
  <rect x="1" y="1" width="658" height="278" rx="18" fill="url(#panel)" stroke="#303b52" stroke-width="1.5"/>
  <path d="M24 1h612" stroke="url(#accent)" stroke-width="3" stroke-linecap="round"/>
  <text x="28" y="38" fill="#e8edf8" font-size="17" font-weight="700">GitHub Stats</text>
  <text x="632" y="37" class="muted" font-size="12" text-anchor="end">${year} · public activity</text>
  <line x1="28" y1="56" x2="632" y2="56" stroke="#303b52"/>
  <a href="${escapeXml(user.url)}" target="_blank" rel="noopener noreferrer">
    <text x="32" y="91" fill="#f0f4fc" font-size="20" font-weight="700">${escapeXml(displayName)}</text>
    <text x="32" y="113" fill="#91a7c5" font-size="13">@${escapeXml(user.login)}</text>
  </a>
  <text x="32" y="151" class="muted" font-size="12">PUBLIC PROFILE</text>
  <text x="32" y="177" fill="#d6deed" font-size="13">${formatNumber(user.repositories.totalCount)} repositories</text>
  <text x="32" y="199" fill="#d6deed" font-size="13">${formatNumber(user.followers.totalCount)} followers</text>
  <circle cx="101" cy="237" r="39" fill="none" stroke="#303b52" stroke-width="7"/>
  <circle cx="101" cy="237" r="39" fill="none" stroke="url(#accent)" stroke-width="7" stroke-linecap="round" transform="rotate(-90 101 237)" stroke-dasharray="${circumference.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"/>
  <text x="101" y="243" fill="#f0f4fc" font-size="20" font-weight="750" text-anchor="middle">${grade}</text>
  <text x="158" y="231" fill="#e0e7f4" font-size="13" font-weight="600">Activity grade</text>
  <text x="158" y="251" class="muted" font-size="11">${formatNumber(total)} contributions</text>
  <line x1="274" y1="72" x2="274" y2="256" stroke="#303b52"/>
  ${metricRows}
</svg>`;
}

function sendError(res, status, message) {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(message);
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendError(res, 405, "Method not allowed. Use GET.");
  }

  const url = new URL(req.url, "https://localhost");
  const username = url.searchParams.get("username") || "fukien";
  const currentYear = new Date().getUTCFullYear();
  const requestedYear = url.searchParams.get("year");
  const year = requestedYear ? Number(requestedYear) : currentYear;
  const token = process.env.GITHUB_TOKEN;

  if (!/^[A-Za-z0-9-]{1,39}$/.test(username) || username.startsWith("-") || username.endsWith("-")) {
    return sendError(res, 400, "Invalid GitHub username.");
  }
  if (!Number.isInteger(year) || year < 2008 || year > currentYear) {
    return sendError(res, 400, `Year must be between 2008 and ${currentYear}.`);
  }
  if (!token) {
    return sendError(res, 503, "The card is not configured. Set GITHUB_TOKEN in the deployment environment.");
  }

  const from = `${year}-01-01T00:00:00Z`;
  const to = year === currentYear ? new Date().toISOString() : `${year}-12-31T23:59:59Z`;

  try {
    const response = await fetch(GITHUB_GRAPHQL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "github-stats-card",
      },
      body: JSON.stringify({ query: QUERY, variables: { login: username, from, to } }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`GitHub GraphQL returned HTTP ${response.status}`);
      return sendError(res, 502, "GitHub could not provide stats for this request.");
    }

    const payload = await response.json();
    if (payload.errors?.length || !payload.data?.user) {
      console.error("GitHub GraphQL returned an error or no matching user.");
      return sendError(res, 404, "GitHub user not found or stats are unavailable.");
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    res.setHeader("Cache-Control", CACHE_CONTROL);
    res.setHeader("X-Content-Type-Options", "nosniff");
    return res.end(renderCard(payload.data.user, year));
  } catch (error) {
    console.error("Unable to fetch GitHub stats:", error.name || "Error");
    return sendError(res, 502, "GitHub could not provide stats for this request.");
  }
};
