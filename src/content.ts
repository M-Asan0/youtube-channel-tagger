import { addTaggedSubscriptionsSection } from "./content/sidebar";
import { addChannelPageTagger } from "./content/channelPageTagger";

function init() {
  addTaggedSubscriptionsSection();
  addChannelPageTagger();

  setTimeout(addTaggedSubscriptionsSection, 1000);
  setTimeout(addTaggedSubscriptionsSection, 3000);

  setTimeout(addChannelPageTagger, 1000);
  setTimeout(addChannelPageTagger, 3000);

  document.addEventListener("yt-navigate-finish", () => {
    addTaggedSubscriptionsSection();
    addChannelPageTagger();
  });
}

init();
