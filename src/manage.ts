import { getAppData } from "./storage";

async function renderChannels() {
  const appData = await getAppData();
  const channelList = document.getElementById("channel-list");

  if (!channelList) return;

  channelList.innerHTML = "";

  const channels = Object.values(appData.channels);

  if (channels.length === 0) {
    const li = document.createElement("li");
    li.textContent = "登録チャンネルがありません";
    channelList.appendChild(li);
    return;
  }

  for (const channel of channels) {
    const li = document.createElement("li");

    const title = document.createElement("strong");
    title.textContent = channel.title;

    const channelId = document.createElement("span");
    channelId.textContent = ` (${channel.id})`;

    li.appendChild(title);
    li.appendChild(channelId);

    channelList.appendChild(li);
  }
}

renderChannels();