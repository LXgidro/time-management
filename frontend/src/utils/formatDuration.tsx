export function formatDurationTimer(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDurationReadable(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours >= 1) {
    if (minutes === 0) {
      return `${hours}ч`;
    }
    return `${hours}ч ${minutes}м`;
  }

  if (minutes >= 1) {
    return `${minutes}м`;
  }

  return `${seconds}с`;
}

export function formatDurationForCharts(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${hours}ч ${minutes.toString().padStart(2, '0')}м`;
}
