import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../companies/entities/company.entity.js';
import { License } from '../licenses/entities/license.entity.js';
import { UsageRecord } from './entities/usage-record.entity.js';

export type UsagePoint = {
  date: string;
  requests: number;
};

export type UsageSnapshot = {
  companyId: string;
  companyName: string;
  planName: string;
  contractedLimit: number;
  currentUsage: number;
  alertThreshold: number;
  periodStart: string;
  periodEnd: string;
  licenseLimit: number;
  assignedLicenses: number;
  series: UsagePoint[];
};

@Injectable()
export class UsageService {
  constructor(
    @InjectRepository(Company)
    private readonly companies: Repository<Company>,
    @InjectRepository(UsageRecord)
    private readonly records: Repository<UsageRecord>,
    @InjectRepository(License)
    private readonly licenses: Repository<License>,
  ) {}

  async getSnapshot(companyId: string): Promise<UsageSnapshot> {
    const company = await this.companies.findOne({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundException('La empresa no existe.');
    }

    const [rows, assignedLicenses] = await Promise.all([
      this.records.find({ where: { companyId }, order: { date: 'ASC' } }),
      this.licenses.count({ where: { companyId, status: 'active' } }),
    ]);

    const series = rows.map((row) => ({
      date: toDateKey(row.date),
      requests: row.requests,
    }));
    const currentUsage = series.reduce((total, point) => total + point.requests, 0);

    return {
      companyId: company.id,
      companyName: company.name,
      planName: company.planName,
      contractedLimit: company.contractedLimit,
      currentUsage,
      alertThreshold: Number(company.alertThreshold),
      periodStart: series[0]?.date ?? '',
      periodEnd: series.at(-1)?.date ?? '',
      licenseLimit: company.licenseLimit,
      assignedLicenses,
      series,
    };
  }
}

function toDateKey(value: string | Date): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value.slice(0, 10);
}
