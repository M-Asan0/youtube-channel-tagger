import { syncSubscribedChannels } from "./content/syncSubscribedChannels";
import { addTaggedSubscriptionsSection } from "./content/sidebar";

function init() {
  addTaggedSubscriptionsSection();

  setTimeout(addTaggedSubscriptionsSection, 1000);
  setTimeout(addTaggedSubscriptionsSection, 3000);

  if (location.pathname === "/feed/channels") {
    syncSubscribedChannels();
  }
}

init();