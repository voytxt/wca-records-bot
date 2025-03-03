// from https://github.com/thewca/wca-live/blob/main/client/src/lib/attempt-result.js
// --------------------------------------------------------------------------------------------

export function formatAttemptResult(attemptResult: number, eventId: string): string {
  if (eventId === '333mbf') return formatMbldAttemptResult(attemptResult);
  if (eventId === '333fm') return formatFmAttemptResult(attemptResult);
  return centisecondsToClockFormat(attemptResult);
}

export function decodeMbldAttemptResult(value: number) {
  if (value <= 0) return { solved: 0, attempted: 0, centiseconds: value };
  const missed = value % 100;
  const seconds = Math.floor(value / 100) % 1e5;
  const points = 99 - (Math.floor(value / 1e7) % 100);
  const solved = points + missed;
  const attempted = solved + missed;
  const centiseconds = seconds === 99999 ? null : seconds * 100;
  return { solved, attempted, centiseconds };
}

function formatMbldAttemptResult(attemptResult: number) {
  const { solved, attempted, centiseconds } =
    decodeMbldAttemptResult(attemptResult);
  const clockFormat = centisecondsToClockFormat(centiseconds);
  const shortClockFormat = clockFormat.replace(/\.00$/, '');
  return `${solved}/${attempted} ${
    centiseconds < 6000 ? `0:${shortClockFormat}` : shortClockFormat
  }`;
}

function formatFmAttemptResult(attemptResult: number) {
  /* Note: FM singles are stored as the number of moves (e.g. 25),
     while averages are stored with 2 decimal places (e.g. 2533 for an average of 25.33 moves). */
  const isAverage = attemptResult >= 1000;
  return isAverage
    ? (attemptResult / 100).toFixed(2)
    : attemptResult.toString();
}

export function centisecondsToClockFormat(centiseconds: number) {
  if (!Number.isFinite(centiseconds)) {
    throw new Error(
      `Invalid centiseconds, expected positive number, got ${centiseconds}.`
    );
  }
  return new Date(centiseconds * 10)
    .toISOString()
    .substr(11, 11)
    .replace(/^[0:]*(?!\.)/g, '');
}

// --------------------------------------------------------------------------------------------

export function capitalizeFirstLetter(val: string) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}
