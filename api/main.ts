import 'dotenv';
import { AtpAgent, RichText } from '@atproto/api';
import { getRecords } from './wca.js';
import { getImage } from './canvas.js';
import * as aw from 'node-appwrite';

export default async (_, response) => {
  console.log('logging into bluesky');
  const agent = new AtpAgent({ service: 'https://bsky.social' });
  await agent.login({ identifier: 'wca.voytxt.com', password: process.env.BSKY_PASSWORD });

  console.log('fetching prev ids');
  const client = new aw.Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('wca-records')
    .setKey(process.env.APPWRITE_API_KEY);
  const db = new aw.Databases(client);
  const prevIds = (await db.getDocument('db', 'collection', 'prev-ids')).ids as string[];

  console.log(`refetching records (prev record count: ${prevIds.length})`);
  const newRecords = await getRecords();

  for await (const record of newRecords.filter((r) => !prevIds.includes(r.id))) {
    console.log('new record in', record.event);

    console.log('generating image');
    const image = getImage(record);

    console.log('uploading image');
    const {
      data: { blob },
    } = await agent.uploadBlob(image);

    console.log('posting');
    const richText = new RichText({
      text: `${record.person} from ${record.country} set a new #speedcubing ${record.tag} in ${record.event} ${record.type} of ${record.time}!`,
    });
    await richText.detectFacets(agent);
    await agent.post({
      text: richText.text,
      facets: richText.facets,
      embed: {
        $type: 'app.bsky.embed.images',
        images: [
          {
            image: blob,
            alt: `${record.event} ${record.type} ${record.tag} by ${record.person}; ${record.time}`,
            aspectRatio: { width: 1000, height: 1000 },
          },
        ],
      },
    });
  }

  console.log('updating db');
  await db.updateDocument('db', 'collection', 'prev-ids', { ids: newRecords.map((r) => r.id) });

  console.log('done');
  return response.send('done');
};

export type Record = {
  id: string;
  tag: 'WR' | 'CR';
  type: 'Single' | 'Average';
  time: string;
  person: string;
  country: string;
  event: string;
  icon: string;
};
