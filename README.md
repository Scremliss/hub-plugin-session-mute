# session-mute — muting sessions in Agents Hub

A hub page plugin: a bell at the row of any session (a specialist, a direction, an executor, the hub itself) and in the
header of the open session. A muted session is like a muted channel in Telegram: it has no blue "new" dot, no "reply?"
hint and no place in the "New" section, its name is gray, and the crossed-out bell icon is always visible.

**Questions and permission requests are not muted:** the red mark and "Waiting for you" stay, so you do not miss what is
blocked on you.

The UI text is in English by default and in Russian for a hub whose language is Russian or Ukrainian (`hub.lang`).

## Install

In Agents Hub: "Settings" → "Plugins" → "Find" → `session-mute`.
Or tell the hub: "install the plugin `Scremliss/hub-plugin-session-mute`" (`hub market install Scremliss/hub-plugin-session-mute`).
Turn it off in the same place, in "Plugins"; the list of muted sessions then stays in the browser.

## What is inside

Only `main.js`: through `hub.addUnread` it turns off "new" for muted sessions, through `hub.addSlot` it draws the bell
(`sidebar.session` and `session.header`) and writes the list of names to the browser's `localStorage`
(`hub.mutedSessions`). It sends nothing to the network and does not call the core. Needs hub Plugin API 1.25 or newer.

## Limitations

- The list is kept in the browser: a phone and another browser have their own.
- There is no item in the right-click menu (plugins cannot extend it) — only the bell.
- "Reply?" is turned off by editing the session row in `addUnread` — if the hub changes this object, the plugin will
  need an update.

License — MIT.
