import { describe, expect, it } from 'vitest';
import { formatElapsed, formatNumber, formatPercent, formatShortDate } from './format';

describe('format helpers', () => {
  it('formats integers with es-CO grouping', () => {
    expect(formatNumber(100000)).toBe('100.000');
  });

  it('formats ratios as percents', () => {
    expect(formatPercent(0.86).replace(/\s/g, '')).toBe('86%');
  });

  it('formats a calendar date without shifting the day', () => {
    const label = formatShortDate('2026-09-01').toLowerCase();
    expect(label).toMatch(/1/);
    expect(label).toContain('sept');
    expect(label).not.toContain('31');
  });

  it('describes how long ago a snapshot was refreshed', () => {
    const now = new Date('2026-09-30T12:00:20Z');
    const from = new Date('2026-09-30T12:00:00Z');
    expect(formatElapsed(from, now)).toBe('hace 20 s');
  });
});
