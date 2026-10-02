import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('usage_records')
@Index(['companyId', 'date'], { unique: true })
export class UsageRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'int' })
  requests: number;
}
