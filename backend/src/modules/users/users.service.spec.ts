import type { Repository } from 'typeorm';
import { Role } from '../../common/enums/role.enum.js';
import { License } from '../licenses/entities/license.entity.js';
import { User } from './entities/user.entity.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  const users = {
    find: vi.fn(),
    createQueryBuilder: vi.fn(),
  };
  const licenses = { find: vi.fn() };
  const service = new UsersService(
    users as unknown as Repository<User>,
    licenses as unknown as Repository<License>,
  );

  const directory: User[] = [
    {
      id: 'u-10',
      name: 'Tomás Beltrán',
      email: 'tomas.beltran@andeslogistica.com',
      passwordHash: 'secret',
      role: Role.User,
      companyId: 'company-1',
    },
    {
      id: 'u-admin',
      name: 'Camila Ríos',
      email: 'admin@andeslogistica.com',
      passwordHash: 'secret',
      role: Role.Admin,
      companyId: 'company-1',
    },
  ];

  it('marca la licencia activa y deja fuera el hash', async () => {
    users.find.mockResolvedValue(directory);
    licenses.find.mockResolvedValue([
      {
        id: 'lic-u-admin',
        userId: 'u-admin',
        companyId: 'company-1',
        status: 'active',
        assignedAt: new Date('2026-08-02T14:10:00.000Z'),
      },
    ]);

    const result = await service.listByCompany('company-1');

    expect(result).toEqual([
      {
        id: 'u-10',
        name: 'Tomás Beltrán',
        email: 'tomas.beltran@andeslogistica.com',
        role: Role.User,
        licenseStatus: 'unassigned',
        assignedAt: null,
      },
      {
        id: 'u-admin',
        name: 'Camila Ríos',
        email: 'admin@andeslogistica.com',
        role: Role.Admin,
        licenseStatus: 'active',
        assignedAt: '2026-08-02T14:10:00.000Z',
      },
    ]);
    expect(result[0]).not.toHaveProperty('passwordHash');
  });

  it('acepta assignedAt persistido como texto', async () => {
    users.find.mockResolvedValue([directory[1]]);
    licenses.find.mockResolvedValue([
      {
        userId: 'u-admin',
        assignedAt: '2026-08-02T14:10:00.000Z',
      },
    ]);

    const result = await service.listByCompany('company-1');

    expect(result[0]?.assignedAt).toBe('2026-08-02T14:10:00.000Z');
  });

  it('busca por correo normalizado e incluye el hash', async () => {
    const query = {
      addSelect: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      getOne: vi.fn().mockResolvedValue(directory[1]),
    };
    users.createQueryBuilder.mockReturnValue(query);

    await expect(service.findByEmail('  Admin@andeslogistica.com ')).resolves.toBe(
      directory[1],
    );
    expect(query.where).toHaveBeenCalledWith('user.email = :email', {
      email: 'admin@andeslogistica.com',
    });
  });

  it('proyecta la sesión pública', () => {
    expect(service.toSession(directory[1]!)).toEqual({
      id: 'u-admin',
      name: 'Camila Ríos',
      email: 'admin@andeslogistica.com',
      role: Role.Admin,
      companyId: 'company-1',
    });
  });
});
