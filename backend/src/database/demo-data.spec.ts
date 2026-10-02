import { buildUsageSeries, DEMO_USERS } from './demo-data.js';

describe('demo data', () => {
  it('arma 30 días de consumo no negativo', () => {
    const series = buildUsageSeries(new Date('2026-10-01T12:00:00.000Z'));

    expect(series).toHaveLength(30);
    expect(new Set(series.map((point) => point.date)).size).toBe(30);
    expect(series.every((point) => /^\d{4}-\d{2}-\d{2}$/.test(point.date))).toBe(true);
    expect(series.every((point) => point.requests >= 0)).toBe(true);
  });

  it('deja cupo para una asignación más', () => {
    const assigned = DEMO_USERS.filter((user) => user.licenseStatus === 'active');

    expect(assigned).toHaveLength(9);
    expect(DEMO_USERS.some((user) => user.licenseStatus === 'unassigned')).toBe(true);
  });
});
