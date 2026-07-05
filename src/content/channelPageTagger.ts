import { fetchAppData, saveAppData } from "../storage";
import type { AppData } from "../types";

function isChannelPage() {
  return (
    location.pathname.startsWith("/@") ||
    location.pathname.startsWith("/channel/") ||
    location.pathname.startsWith("/c/") ||
    location.pathname.startsWith("/user/")
  );
}

function getCurrentChannelInfo() {
  const channelId =
    document
      .querySelector('meta[itemprop="identifier"]')
      ?.getAttribute("content") ?? null;

  const title =
    document
      .querySelector('meta[property="og:title"]')
      ?.getAttribute("content") ??
    document.title.replace(" - YouTube", "");

  const url =
    document
      .querySelector('meta[property="og:url"]')
      ?.getAttribute("content") ?? location.href;

  if (!channelId) return null;

  return {
    id: channelId,
    title,
    url,
    lastSeenAt: Date.now(),
  };
}

function findChannelButtonArea() {
  return (
    document.querySelector("yt-flexible-actions-view-model") ??
    document.querySelector("yt-button-view-model a[aria-label*='コミュニティ']")
      ?.parentElement?.parentElement ??
    document.querySelector("yt-button-view-model a[aria-label*='Community']")
      ?.parentElement?.parentElement
  );
}

export async function addChannelPageTagger() {
  if (!isChannelPage()) return;
  const existing = document.getElementById("yt-channel-page-tagger");
  if (existing) existing.remove();

  const channel = getCurrentChannelInfo();
  if (!channel) return;

  const channelId = channel.id;

  const target = findChannelButtonArea();
  if (!target) return;

  const sampleTextElement = target.querySelector("button, a, span");

  const textColor = sampleTextElement
    ? getComputedStyle(sampleTextElement).color
    : "#f1f1f1";

  let data: AppData;
  try {
    data = await fetchAppData();
  } catch {
    return;
  }

  const existingChannel = data.channels[channelId];
  const channelChanged =
    !existingChannel ||
    existingChannel.title !== channel.title ||
    existingChannel.url !== channel.url;

  if (channelChanged) {
    data.channels[channelId] = channel;
    await saveAppData(data);
  }

  const tags = Object.values(data.tags).sort((a, b) => a.order - b.order);

  const wrapper = document.createElement("div");
  wrapper.id = "yt-channel-page-tagger";
  wrapper.style.display = "inline-flex";
  wrapper.style.alignItems = "center";
  wrapper.style.gap = "6px";
  wrapper.style.marginLeft = "8px";
  wrapper.style.color = textColor;
  wrapper.style.fontSize = "13px";
  wrapper.style.verticalAlign = "middle";

  const select = document.createElement("select");
  select.style.height = "32px";
  select.style.borderRadius = "16px";
  select.style.border = "1px solid rgba(255,255,255,0.2)";
  select.style.padding = "0 10px";
  select.style.background = "rgba(255,255,255,0.1)";
  select.style.color = textColor;
  select.style.fontSize = "13px";
  select.style.cursor = "pointer";

  const selectedArea = document.createElement("div");
  selectedArea.style.display = "inline-flex";
  selectedArea.style.alignItems = "center";
  selectedArea.style.gap = "4px";
  selectedArea.style.flexWrap = "wrap";

  function renderOptions() {
    select.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "タグを選択...";
    placeholder.hidden = true;
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);

    const selectedIds = data.channelTags[channelId] ?? [];

    for (const tag of tags) {
      if (selectedIds.includes(tag.id)) continue;

      const option = document.createElement("option");
      option.value = tag.id;
      option.textContent = tag.name;
      option.style.color = "#0f0f0f";
      select.appendChild(option);
    }

    select.value = "";
  }

  function renderSelectedTags() {
    selectedArea.innerHTML = "";

    const selectedIds = data.channelTags[channelId] ?? [];

    for (const tagId of selectedIds) {
      const tag = data.tags[tagId];
      if (!tag) continue;

      const chip = document.createElement("span");
      chip.style.display = "inline-flex";
      chip.style.alignItems = "center";
      chip.style.gap = "4px";
      chip.style.background = tag.color;
      chip.style.color = "#fff";
      chip.style.borderRadius = "999px";
      chip.style.padding = "4px 8px";
      chip.style.fontSize = "12px";
      chip.style.whiteSpace = "nowrap";

      const name = document.createElement("span");
      name.textContent = tag.name;

      const removeButton = document.createElement("button");
      removeButton.textContent = "×";
      removeButton.style.background = "none";
      removeButton.style.border = "none";
      removeButton.style.color = "#fff";
      removeButton.style.cursor = "pointer";
      removeButton.style.padding = "0";
      removeButton.style.lineHeight = "1";
      removeButton.style.fontSize = "13px";

      removeButton.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const nextIds = (data.channelTags[channelId] ?? []).filter(
          (id) => id !== tagId
        );

        if (nextIds.length > 0) {
          data.channelTags[channelId] = nextIds;
        } else {
          delete data.channelTags[channelId];
        }

        await saveAppData(data);
        renderSelectedTags();
        renderOptions();
      });

      chip.appendChild(name);
      chip.appendChild(removeButton);
      selectedArea.appendChild(chip);
    }
  }

  select.addEventListener("change", async () => {
    const tagId = select.value;
    if (!tagId) return;

    const selectedIds = data.channelTags[channelId] ?? [];

    if (!selectedIds.includes(tagId)) {
      data.channelTags[channelId] = [...selectedIds, tagId];
      await saveAppData(data);
    }

    renderSelectedTags();
    renderOptions();
  });

  renderSelectedTags();
  renderOptions();

  wrapper.appendChild(select);
  wrapper.appendChild(selectedArea);

  target.appendChild(wrapper);
}