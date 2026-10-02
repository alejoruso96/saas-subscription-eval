import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('companies')
export class Company {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  planName: string;

  @Column({ type: 'int' })
  contractedLimit: number;

  @Column({ type: 'int' })
  licenseLimit: number;

  @Column({ type: 'float' })
  alertThreshold: number;
}
