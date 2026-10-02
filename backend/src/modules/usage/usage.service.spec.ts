import { NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { Role } from '../../common/enums/role.enum.js';
import { Company } from '../companies/entities/company.entity.js';
import { License } from '../licenses/entities/license.entity.js';
import { UsageRecord } from './entities/usage-record.entity.js';
import { UsageService } from './usage.service.js';

const company: Company = {
  id: 'company-1',
  name: 'Andes Logística S.A.S.',
  planName: 'Business',
  contractedLimit: 120_000,
  licenseLimit: 10,
  alertThreshold: 0.8,
};

describe('UsageService', () => {
  const companies = { findOne: vi.fn() };
  const records = { find: vi.fn() };
  const licenses = { count: vi.fn() };
  const service = new UsageService(
    companies as unknown as Repository<Company>,
    records as unknown as Repository<UsageRecord>,
    licenses as unknown as Repository<License>,
  );

  beforeEach(() => {
    companies.findOne.mockReset();
    records.find.mockReset();
    licenses.count.mockReset();
  });

  it('suma el consumo y arma el periodo', async () => {
    companies.findOne.mockResolvedValue(company);
    records.find.mockResolvedValue([
      { date: '2026-09-01', requests: 100 },
      { date: '2026-09-02', requests: 40 },
    ]);
    licenses.count.mockResolvedValue(9);

    await expect(service.getSnapshot('company-1')).resolves.toEqual({
      companyId: 'company-1',
      companyName: 'Andes Logística S.A.S.',
      planName: 'Business',
      contractedLimit: 120_000,
      currentUsage: 140,
      alertThreshold: 0.8,
      periodStart: '2026-09-01',
      periodEnd: '2026-09-02',
      licenseLimit: 10,
      assignedLicenses: 9,
      series: [
        { date: '2026-09-01', requests: 100 },
        { date: '2026-09-02', requests: 40 },
      ],
    });
  });

  it('normaliza fechas Date al día calendario', async () => {
    companies.findOne.mockResolvedValue(company);
    records.find.mockResolvedValue([
      { date: new Date('2026-09-03T00:00:00.000Z'), requests: 10 },
    ]);
    licenses.count.mockResolvedValue(0);

    const snapshot = await service.getSnapshot('company-1');

    expect(snapshot.series[0]?.date).toBe('2026-09-03');
    expect(snapshot.periodStart).toBe('2026-09-03');
  });

  it('responde 404 si la empresa no existe', async () => {
    companies.findOne.mockResolvedValue(null);

    await expect(service.getSnapshot('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
