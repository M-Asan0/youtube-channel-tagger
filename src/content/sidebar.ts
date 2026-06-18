import { fetchAppData } from "../storage";

export async function addTaggedSubscriptionsSection() {
  if (document.getElementById("yt-channel-tagger-section")) return;

  const sections = document.querySelector("ytd-guide-renderer #sections");
  if (!sections) return;

  const sampleTextElement =
    sections.querySelector("a, yt-formatted-string, span, #text");

  const textColor = sampleTextElement
    ? getComputedStyle(sampleTextElement).color
    : "#f1f1f1";

  let data;
  try {
    data = await fetchAppData();
  } catch {
    return;
  }

  let manageUrl: string;
  try {
    manageUrl = chrome.runtime.getURL("manage.html");
  } catch {
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.id = "yt-channel-tagger-section";
  wrapper.style.padding = "8px 0";
  wrapper.style.borderTop = "1px solid var(--yt-spec-10-percent-layer)";

  const title = document.createElement("div");
  title.textContent = "Channel Tags";
  title.style.padding = "8px 24px";
  title.style.fontSize = "14px";
  title.style.fontWeight = "600";
  title.style.color = textColor;

  wrapper.appendChild(title);

  const manageLink = document.createElement("a");
  manageLink.href = manageUrl;
  manageLink.target = "_blank";
  manageLink.textContent = "Open tag management";

  manageLink.style.display = "block";
  manageLink.style.padding = "6px 24px";
  manageLink.style.color = textColor;
  manageLink.style.textDecoration = "none";
  manageLink.style.fontSize = "13px";

  wrapper.appendChild(manageLink);

  const tags = Object.values(data.tags).sort(
    (a, b) => a.order - b.order
  );

  const channels = Object.values(data.channels).sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  for (const tag of tags) {
    const taggedChannels = channels.filter((channel) =>
      data.channelTags[channel.id]?.includes(tag.id)
    );

    if (taggedChannels.length === 0) continue;

    const details = document.createElement("details");
    details.open = true;

    const summary = document.createElement("summary");

    summary.style.padding = "8px 24px 4px";
    summary.style.fontSize = "13px";
    summary.style.fontWeight = "600";
    summary.style.color = textColor;
    summary.style.display = "flex";
    summary.style.alignItems = "center";
    summary.style.cursor = "pointer";
    summary.style.listStyle = "none";

    const arrow = document.createElement("span");

    arrow.textContent = details.open ? "▼" : "▶";

    arrow.style.display = "inline-block";
    arrow.style.width = "16px";
    arrow.style.marginRight = "4px";
    arrow.style.fontSize = "10px";
    arrow.style.flexShrink = "0";
    arrow.style.color = textColor;

    const tagColor = document.createElement("div");

    tagColor.style.backgroundColor = tag.color;
    tagColor.style.width = "12px";
    tagColor.style.height = "12px";
    tagColor.style.display = "inline-block";
    tagColor.style.marginRight = "8px";
    tagColor.style.borderRadius = "2px";
    tagColor.style.flexShrink = "0";

    const tagName = document.createElement("span");

    tagName.textContent = tag.name;
    tagName.style.color = textColor;

    summary.appendChild(arrow);
    summary.appendChild(tagColor);
    summary.appendChild(tagName);

    details.appendChild(summary);

    details.addEventListener("toggle", () => {
      arrow.textContent = details.open ? "▼" : "▶";
    });

    for (const channel of taggedChannels) {
      const link = document.createElement("a");

      link.href = channel.url;
      link.textContent = channel.title;

      link.style.display = "block";
      link.style.padding = "2px 24px 2px 36px";
      link.style.color = textColor;
      link.style.textDecoration = "none";
      link.style.fontSize = "14px";
      link.style.whiteSpace = "nowrap";
      link.style.overflow = "hidden";
      link.style.textOverflow = "ellipsis";

      details.appendChild(link);
    }

    wrapper.appendChild(details);
  }

  const subscriptionSection = Array.from(sections.children).find(
    (child) =>
      child.textContent?.includes("登録チャンネル") ||
      child.textContent?.includes("Subscriptions")
  );

  if (subscriptionSection) {
    sections.insertBefore(wrapper, subscriptionSection);
  } else {
    sections.appendChild(wrapper);
  }
}