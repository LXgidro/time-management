export function validateDateRange(
  start: Date | null,
  end: Date | null,
): string | null {
  if (start && end && start > end) {
    return 'startDate должен быть до или равным endDate';
  }

  if (start && end) {
    const maxDays = 365;
    const diffDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays > maxDays) {
      return `Период не может превышать ${maxDays} дней`;
    }
  }

  return null;
}
