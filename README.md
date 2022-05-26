# tailchat-rss-bot
RSS Notify Bot for Tailchat

Its is free and dont need deploy! Everything is work by github action!

Save data with [moonrailgun/branch-filestorage-action](https://github.com/moonrailgun/branch-filestorage-action)

## Usage

- Fork it
- Ensure auto action enabled(you can trigger it manual)
- Set Secrets(environment) for action runtime, the params format below

## Env

| Key | Describe |
| ---- | -------- |
| RSS_URL | RSS url for check |
| TC_NOTIFY_URL | Notify url for tailchat, (e.g. https://paw-server-nightly.moonrailgun.com/api/plugin:com.msgbyte.simplenotify/webhook/callback?subscribeId=<ID>) you have to apply it before |
