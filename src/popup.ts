document.getElementById("open-manage")?.addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("manage.html") });
  window.close();
});
