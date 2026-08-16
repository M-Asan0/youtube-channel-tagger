# Privacy Policy — Channel Tagger for YouTube

**Last updated: August 16, 2026**

## Summary

Channel Tagger for YouTube does not collect, transmit, or sell any personal data. Everything the
extension stores stays on your own device.

## What the extension stores

The extension saves the following on your device, using the browser's `chrome.storage.local` API:

- Tags you create (name, color, display order)
- The list of channels you are subscribed to (channel ID, channel title, channel URL), retrieved
  from your own YouTube subscriptions page when you press "Sync subscribed channels"
- The assignments between your tags and those channels

This data exists only so the extension can show your subscriptions grouped by your tags. It is
never sent to the developer or to any third party. There are no analytics, no tracking, and no
external servers.

## Network access

The extension communicates with `youtube.com` and no other host.

- Content scripts run on YouTube pages to display the tag list in the sidebar and to let you tag a
  channel from its channel page.
- When you press "Sync subscribed channels", the extension requests
  `https://www.youtube.com/feed/channels` in order to read your own subscription list. The response
  is parsed as data and stored locally.

Your use of YouTube itself is governed by
[Google's Privacy Policy](https://policies.google.com/privacy).

## Your control over the data

- **Export**: the Import / Export screen lets you save your tags and assignments to a file.
- **Delete**: removing the extension from Chrome deletes all data it stored. You can also delete
  individual tags at any time from the Tags screen.

## Permissions

| Permission | Why it is needed |
| --- | --- |
| `storage` | To save your tags, channel list, and tag assignments on your device. |
| `https://www.youtube.com/*` | To display tags on YouTube pages and to read your own subscription list when you request a sync. |

The extension does not use remote code. All scripts and styles ship inside the extension package.

## Changes to this policy

If this policy changes, the updated version will be published on this page with a new "Last
updated" date.

## Contact

Questions about this policy can be sent to **archement.labs@gmail.com**, or raised as an issue at
<https://github.com/M-Asan0/channel-tagger-for-youtube/issues>.
