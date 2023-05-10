import type { NextApiRequest, NextApiResponse } from 'next'
import RssParser from 'rss-parser';
import redis from '@/utils/redis'
import { send_messege } from '@/utils/telegram';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<unknown>
) {
  const rss_list = [
    'https://www.chosun.com/arc/outboundfeeds/rss/?outputType=xml', // 조선일보
    'https://rss.donga.com/total.xml', // 동아일보
    'https://rss.hankyung.com/feed/headline.xml', // 한국경제
  ];

  rss_list.forEach(async (rss_url) => {
    const parser = new RssParser();
    const feed = await parser.parseURL(rss_url);

    const press = feed.title;
    const last_article = feed.items[0].title;
    const last_article_link = feed.items[0].link;

    const last_article_key = `${press}_last_article_title`;
    const last_articel_link_key = `${press}_last_article_link`;

    const last_article_in_redis = await redis.get(last_article_key);
    const last_article_link_in_redis = await redis.get(last_articel_link_key);

    const is_duplicated = 
      last_article_in_redis === last_article ||
      last_article_link_in_redis === last_article_link;

    if (is_duplicated) {
      return;
    }

    await redis.set(last_article_key, last_article);
    await redis.set(last_articel_link_key, last_article_link);

    const chat_id = process.env.TELEGRAM_CHAT_ID as string;
    const messege = `**[${press}]** ${last_article}\n${last_article_link}`;

    send_messege(
      chat_id,
      messege
    );
  });

  res.status(200).json({})
}
