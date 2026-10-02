import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('licenses')
export class License {
  @PrimaryColumn()
  id: string;

  @Index({ unique: true })
  @Column()
  userId: string;

  @Index()
  @Column()
  companyId: string;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status: 'active';

  @Column({ type: 'timestamptz' })
  assignedAt: Date;
}
