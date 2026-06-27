import { syncSubscribedChannels } from "./content/syncSubscribedChannels";
import { addTaggedSubscriptionsSection } from "./content/sidebar";
import { addChannelPageTagger } from "./content/channelPageTagger";

let lastPathname = location.pathname;

function init() {
  addTaggedSubscriptionsSection();
  addChannelPageTagger();

  setTimeout(addTaggedSubscriptionsSection, 1000);
  setTimeout(addTaggedSubscriptionsSection, 3000);

  setTimeout(addChannelPageTagger, 1000);
  setTimeout(addChannelPageTagger, 3000);

  if (location.pathname === "/feed/channels") {
    syncSubscribedChannels();
  }

  document.addEventListener("yt-navigate-finish", () => {
    const enteredChannelsPage =
      location.pathname === "/feed/channels" &&
      lastPathname !== location.pathname;

    lastPathname = location.pathname;

    addTaggedSubscriptionsSection();
    addChannelPageTagger();

    if (enteredChannelsPage) {
      chrome.runtime.sendMessage({ type: "syncChannelsRequest" }).catch(() => {});
    }
  });
}

init();
