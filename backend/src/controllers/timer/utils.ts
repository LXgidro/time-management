import { HasTimerFields } from '../../models/Timer';

export function calculateElapsedSeconds(timer: HasTimerFields): number {
  const now = Date.now();
  const startTime = timer.startTime.getTime();
  let elapsed = Math.floor((now - startTime) / 1000);

  if (timer.status === 'running') {
    elapsed -= timer.totalPausedDuration;
  } else if (timer.status === 'paused' && timer.pausedAt) {
    const pauseTime = timer.pausedAt.getTime();
    elapsed =
      Math.floor((pauseTime - startTime) / 1000) - timer.totalPausedDuration;
  }

  return Math.max(0, elapsed);
}
