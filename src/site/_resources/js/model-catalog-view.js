export function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export function formatContext(tokens) {
  if (!Number.isFinite(tokens) || tokens <= 0) return "See model details";
  if (tokens >= 1000000) {
    const millions = tokens / 1000000;
    return `${millions < 1.1 ? 1 : Number.parseFloat(millions.toFixed(1))}M tokens`;
  }
  return tokens >= 1000 ? `${Math.round(tokens / 1000)}K tokens` : `${tokens} tokens`;
}

function formatDollarsPerMillion(perToken) {
  const perMillion = perToken * 1_000_000;
  return `$${perMillion.toFixed(2)}`;
}

export function formatCost(inputCostPerToken, outputCostPerToken) {
  const hasInput = Number.isFinite(inputCostPerToken) && inputCostPerToken >= 0;
  const hasOutput = Number.isFinite(outputCostPerToken) && outputCostPerToken >= 0;
  if (hasInput && hasOutput) {
    return `${formatDollarsPerMillion(inputCostPerToken)} / ${formatDollarsPerMillion(outputCostPerToken)}`;
  }
  if (hasInput) return `${formatDollarsPerMillion(inputCostPerToken)} in`;
  if (hasOutput) return `${formatDollarsPerMillion(outputCostPerToken)} out`;
  return "See details";
}

const MODEL_PRESENTATION = {
  "api-deepseek-4.1-flash": {
    displayName: "DeepSeek 4.1 Flash",
    family: "DeepSeek",
    logo: { src: "/_images/model-logos/deepseek.svg", alt: "DeepSeek" },
  },
  "api-open-jev": {
    displayName: "KnowLine 35B",
    family: "KnowLine 35B",
    type: "Decision model",
    logo: { src: "/_images/model-logos/knowline.svg", alt: "KnowLine" },
  },
  "us.zai.glm-5.3": {
    displayName: "GLM 5.3",
    family: "GLM",
    logo: { src: "/images/model-logos/zai.webp", alt: "Z.ai" },
  },
};

function presentationFor(model) {
  const override = MODEL_PRESENTATION[model.id];
  if (!override) return model;
  const rawName = (model.displayName || "").trim();
  const hasRawIdName = !rawName
    || rawName.toLowerCase() === model.id.toLowerCase()
    || /^us\.zai\.|^deepseek\b|^open jev$/i.test(rawName);
  const rawFamily = (model.family || "").trim();
  const hasRawFamily = !rawFamily
    || rawFamily.toLowerCase() === model.id.toLowerCase()
    || /^us\.zai\.|^deepseek\b|^open jev$/i.test(rawFamily);
  return {
    ...model,
    displayName: hasRawIdName ? override.displayName : model.displayName,
    family: hasRawFamily ? override.family : model.family,
    type: (!model.type || model.type === "See model details") && override.type ? override.type : model.type,
    logo: model.logo === undefined || model.logo === null ? override.logo : model.logo,
  };
}

function familyFor(model) {
  if (model.family) return model.family;
  const families = [
    [/^gpt-/, "GPT"],
    [/^claude-/, "Claude"],
    [/^gemini-/, "Gemini"],
    [/^(api-glm-|us\.zai\.glm-)/, "GLM"],
    [/^api-gemma-/, "Gemma"],
    [/^api-deepseek-/, "DeepSeek"],
    [/^(kimi-|moonshotai\.kimi-)/, "Kimi"],
  ];
  return families.find(([pattern]) => pattern.test(model.id))?.[1] || model.displayName;
}

export function groupModels(models) {
  const groups = new Map();
  for (const rawModel of models) {
    const model = presentationFor(rawModel);
    const family = familyFor(model);
    const key = JSON.stringify([model.hosting, model.type, family]);
    if (!groups.has(key)) groups.set(key, { family, hosting: model.hosting, type: model.type, models: [] });
    groups.get(key).models.push(model);
  }
  return [...groups.values()];
}

function groupLabel(group) {
  if (group.models.length === 1) return group.models[0].displayName;
  const versions = group.models.map((model) => model.displayName.match(/\b\d+(?:\.\d+)?\b/)?.[0]);
  if (versions[0] && versions.every((version) => version === versions[0])) return `${group.family} ${versions[0]}`;
  const major = versions[0]?.split(".")[0];
  if (major && versions.every((version) => version?.split(".")[0] === major)) return `${group.family} ${major} series`;
  return group.family;
}

function groupContext(group) {
  const limits = group.models.map((model) => model.maxInputTokens);
  if (limits.every((limit) => !Number.isFinite(limit) || limit <= 0)) return "See details";
  if (limits.some((limit) => !Number.isFinite(limit) || limit <= 0)) return "Varies by route";
  const low = Math.min(...limits), high = Math.max(...limits);
  const short = (limit) => formatContext(limit).replace(" tokens", "");
  return low === high ? short(low) : `${short(low)}–${short(high)}`;
}

function groupCost(group) {
  if (group.models.length === 1) {
    const [model] = group.models;
    return formatCost(model.inputCostPerToken, model.outputCostPerToken);
  }
  const priced = group.models.filter((model) => Number.isFinite(model.inputCostPerToken) && model.inputCostPerToken >= 0);
  if (!priced.length) return "See details";
  const sorted = [...priced].sort((a, b) => a.inputCostPerToken - b.inputCostPerToken);
  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];
  const lowestText = formatCost(lowest.inputCostPerToken, lowest.outputCostPerToken);
  const highestText = formatCost(highest.inputCostPerToken, highest.outputCostPerToken);
  return lowestText === highestText ? lowestText : `From ${lowestText}`;
}

function logoFor(group, endpoint, siteOrigin) {
  const logo = group.models.find((model) => model.logo?.src)?.logo;
  if (!logo || typeof logo.src !== "string") return "";
  let src = "";
  if (/^\/images\/model-logos\/[\w.-]+$/.test(logo.src)) {
    src = new URL(logo.src, endpoint).href;
  } else if (/^\/_images\/model-logos\/[\w.-]+$/.test(logo.src)) {
    src = siteOrigin ? `${siteOrigin.replace(/\/$/, "")}${logo.src}` : logo.src;
  } else {
    return "";
  }
  return `<img class="model-catalog-logo" src="${escapeHtml(src)}" alt="${escapeHtml(logo.alt || "")}" width="32" height="32" loading="lazy" decoding="async">`;
}

function renderGroup(group, endpoint, siteOrigin) {
  const label = groupLabel(group);
  const version = label.replace(`${group.family} `, "");
  const variants = group.models.length > 1 ? group.models.map((model) => {
    let value = model.displayName.replace(`${group.family} `, "");
    if (!version.includes("series")) value = value.replace(version, "").trim();
    return value || "Standard";
  }).join(" · ") : "";
  const task = group.type === "Chat and reasoning" ? "" : group.type;
  const subtitle = [variants, task].filter(Boolean).join(" · ");
  const ids = group.models.map((model) => {
    const cost = formatCost(model.inputCostPerToken, model.outputCostPerToken);
    const meta = cost === "See details"
      ? formatContext(model.maxInputTokens)
      : `${formatContext(model.maxInputTokens)} · ${cost} per 1M`;
    return `<li data-model-id="${escapeHtml(model.id)}"><code class="model-catalog-request-id">${escapeHtml(model.id)}</code><span>${escapeHtml(meta)}</span></li>`;
  }).join("");
  return `<tr><td><details class="model-catalog-family" data-model-family="${escapeHtml(JSON.stringify([group.hosting, group.type, group.family]))}"><summary>${logoFor(group, endpoint, siteOrigin)}<span class="model-catalog-name"><strong>${escapeHtml(label)}</strong>${subtitle ? `<span>${escapeHtml(subtitle)}</span>` : ""}</span><span class="sr-only"> (request IDs, limits, and rates)</span></summary><ul class="model-catalog-routes" aria-label="Request IDs for ${escapeHtml(label)}">${ids}</ul></details></td><td class="model-catalog-context">${escapeHtml(groupContext(group))}</td><td class="model-catalog-cost">${escapeHtml(groupCost(group))}</td></tr>`;
}

export function renderModelCatalog(models, endpoint, options = {}) {
  const groups = groupModels(models);
  const siteOrigin = options.siteBasePath || "";
  return ["UC-hosted", "Approved enterprise cloud"].map((hosting) => {
    const selected = groups.filter((group) => group.hosting === hosting);
    if (!selected.length) return "";
    const label = hosting === "UC-hosted" ? "UCSD-Hosted" : hosting;
    return `<section class="model-catalog-hosting" aria-label="${label}"><h3>${label}</h3><table class="table model-catalog-table"><caption class="sr-only">${label} model families. Expand a family for request IDs, context limits, and per-million-token rates.</caption><thead><tr><th scope="col">Model family</th><th scope="col">Context</th><th scope="col">Per 1M (in/out)</th></tr></thead><tbody>${selected.map((group) => renderGroup(group, endpoint, siteOrigin)).join("")}</tbody></table></section>`;
  }).join("");
}
