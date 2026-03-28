import { AtpAgent, RichText } from 'atproto';
import { getImage } from './canvas.ts';
import { getRecords } from './wca.ts';

Deno.serve(() => new Response());

Deno.cron('update', { minute: { every: 10 } }, async () => {
  const db = await Deno.openKv();

  console.log('logging into bluesky');
  const agent = new AtpAgent({ service: 'https://bsky.social' });
  await agent.login({
    identifier: Deno.env.get('BSKY_USER')!,
    password: Deno.env.get('BSKY_PASSWORD')!,
  });

  console.log('fetching prev ids');

  const prevIds = ((await db.get(['prev-ids'])).value ?? []) as string[];

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
      text: `${record.person} from ${record.country} set a new #speedcubing ${record.tag} in ${record.event} ${record.type} of ${record.result}!`,
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
            alt: `${record.event} ${record.type} ${record.tag} by ${record.person}; ${record.result}`,
            aspectRatio: { width: 1000, height: 1000 },
          },
        ],
      },
    });
  }

  console.log('updating db');
  await db.set(
    ['prev-ids'],
    newRecords.map((r) => r.id),
  );

  console.log('done');
  db.close();
});

export type Record = {
  id: string;
  tag: 'WR' | 'CR';
  type: 'Single' | 'Average';
  result: string;
  person: string;
  country: string;
  event: string;
  icon: string;
};
