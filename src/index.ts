import Parser from 'rss-parser';
import got from 'got';
import { JSONFile, Low } from 'lowdb';
import path from 'node:path';
import md5 from 'md5';
import dayjs from 'dayjs';
import { fileURLToPath } from 'node:url';
import isUrl from 'is-url';

const rssUrls = (process.env.RSS_URL ?? '').split(',');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface DBType {
  posts: {
    rssHash: string;
    guid: string; // 唯一标识
  }[];
}

const file = path.resolve(__dirname, '../db/posts.json');
const adapter = new JSONFile<DBType>(file);
const db = new Low<DBType>(adapter);

const parser = new Parser();

async function readDb() {
  await db.read();
  db.data ||= { posts: [] };
}

async function saveDb() {
  await db.write();
}

async function parseRss(url: string) {
  const data = db.data;
  if (!data) {
    throw new Error('db.data not inited');
  }

  const feed = await parser.parseURL(url);
  const urlHash = md5(url);

  let text = '';

  feed.items.forEach((item) => {
    const guid = item.guid;
    // 确保有连接
    if (typeof guid !== 'string') {
      console.warn('Item not include guid');
      return;
    }

    // 还没被记录过
    if (
      data.posts.findIndex((p) => p.rssHash === urlHash && p.guid === guid) >= 0
    ) {
      // Skip
      return;
    }

    // 存在日期
    if (item.pubDate || item.isoDate) {
      // 确保是当天的内容，太久远的不要
      if (!dayjs(item.pubDate || item.isoDate).isSame(dayjs(), 'date')) {
        console.warn('Item too old, ignored:', guid);
        return;
      }
    }

    // 记录item
    if (text === '') {
      // 初始化
      text += `${feed.title}\n`;
    }
    text += `${item.title ?? ''}\n${item.contentSnippet ?? ''}...\n\n${
      item.link
    }\n------------------------\n`;

    data.posts.push({
      rssHash: urlHash,
      guid: guid,
    });
  });

  if (text !== '') {
    // 发送通知 TODO
    console.log('发送通知...');
    console.log(text);
  }
}

readDb()
  .then(async () => {
    if (rssUrls.length === 1 && rssUrls[0] === '') {
      console.warn('No rss urls, please set it with env: RSS_URL=xxxxxx,xxxxx');
      return;
    }

    for (const url of rssUrls) {
      if (isUrl(url)) {
        await parseRss(url);
      } else {
        console.warn(`url [${url}] is not valid url`);
      }
    }
  })
  .then(() => saveDb());
