const HIDDEN_SYNC_TIMEOUT_MS = 8000;

function syncChannelsViaHiddenTab(): Promise<void> {
  return new Promise((resolve) => {
    chrome.tabs.create(
      { url: "https://www.youtube.com/feed/channels", active: false },
      (tab) => {
        const tabId = tab?.id;
        let settled = false;
        let timer: ReturnType<typeof setTimeout>;

        const finish = () => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          chrome.runtime.onMessage.removeListener(onMessage);
          if (tabId !== undefined) {
            chrome.tabs.remove(tabId).catch(() => {});
          }
          resolve();
        };

        const onMessage = (
          message: any,
          sender: chrome.runtime.MessageSender
        ) => {
          if (sender.tab?.id === tabId && message?.type === "channelsSynced") {
            finish();
          }
        };
        chrome.runtime.onMessage.addListener(onMessage);
        timer = setTimeout(finish, HIDDEN_SYNC_TIMEOUT_MS);
      }
    );
  });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "syncChannelsRequest") return;

  syncChannelsViaHiddenTab().then(() => sendResponse({ ok: true }));
  return true;
});
