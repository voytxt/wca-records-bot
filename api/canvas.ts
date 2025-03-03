import { Record } from './main.js';
import { createCanvas, registerFont } from 'canvas';
import path from 'path';

export function getImage(record: Record): Uint8Array {
  registerFont(path.join(process.cwd(), 'fonts', 'cubing-icons.ttf'), { family: 'cubing-icons' });
  registerFont(path.join(process.cwd(), 'fonts', 'montserrat.ttf'), { family: 'Montserrat' });

  const canvas = createCanvas(1000, 1000);
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 1000, 1000);

  if (record.tag === 'WR') {
    gradient.addColorStop(0, '#ec003f');
    gradient.addColorStop(0.5, '#ff6467');
  } else {
    gradient.addColorStop(0.5, '#51a2ff');
    gradient.addColorStop(1, '#00a6f4');
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1000, 1000);

  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';

  function fitText(txt: string, maxW: number, maxF: number): string {
    let f = maxF;
    ctx.font = `${f}px Montserrat`;

    while (ctx.measureText(txt).width > maxW) {
      f -= 4;
      ctx.font = `${f}px Montserrat`;
    }
    return ctx.font;
  }

  ctx.font = fitText(`${record.event} ${record.type} ${record.tag}`, 900, 48);
  ctx.fillText(`${record.event} ${record.type} ${record.tag}`, 500, 100);

  const personText = `by ${record.person}`;
  ctx.font = fitText(personText, 900, 48);
  ctx.fillText(personText, 500, 175);

  ctx.font = '256px cubing-icons';
  ctx.fillText(record.icon, 500, 610);

  ctx.font = fitText(record.time.toString(), 900, 224);
  ctx.fillText(record.time.toString(), 500, 925);

  return canvas.toBuffer('image/png');
}
