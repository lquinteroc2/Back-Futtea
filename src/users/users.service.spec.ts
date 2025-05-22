import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { Role, Users } from "./entities/user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FilesUploadRepository } from "src/file-upload/file-upload.repository";
import { count } from "console";
import { CredentialType, Credential } from "src/credential/entities/credential.entity";

describe('UsersService', () => {

  let usersService: UsersService;
  let repository: Repository<Users>;

  const mockUsers: Partial<Users>[] = [
    {
      uuid: '123',
      name: 'Juan',
      email: 'juan@example.com',
      role: Role.USER,
    },
    {
      uuid: '456',
      name: 'Ana',
      email: 'ana@example.com',
      role: Role.ADMIN,
    },
  ];

  const mockCredentials: Partial<Credential> = {
    type: CredentialType.LOCAL,
    identifier: 'ana@example.com',
    secretHash: 'asdoqefpqeofjo324314',

  }

    const mockUsersRepository = {
      create: jest.fn().mockImplementation((data) => ({
        ...data,
        uuid: 'mocked-uuid',
      })),
      count: jest.fn().mockResolvedValue(mockUsers.length),
      save: jest.fn().mockImplementation((user) => Promise.resolve(user)),
      findAndCount: jest.fn().mockResolvedValue([mockUsers, mockUsers.length]),
      findOne: jest.fn().mockImplementation(({ where }) => {

        if (Array.isArray(where)) {
          const email = where.find(cond => cond.email)?.email;
          const userName = where.find(cond => cond.user_name)?.user_name;
          const uuid = where.find(cond => cond.uuid)?.uuid;
              
          return Promise.resolve(
            mockUsers.find(
              user =>
                (email && user.email === email) ||
                (userName && user.user_name === userName) ||
                (uuid && user.uuid === uuid)
            )
          );
        }
      
        if (typeof where === 'object') {
          const [[key, value]] = Object.entries(where);
          return Promise.resolve(mockUsers.find(user => user[key] === value));
        }
      
        return Promise.resolve(undefined);
      }),
      manager: {
        save: jest.fn().mockResolvedValue(mockCredentials),
      },
    };

  const mockFilesRepository = {
    deleteImageFromCloudinary: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(Users),
          useValue: mockUsersRepository,
        },
        {
          provide: FilesUploadRepository,
          useValue: mockFilesRepository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    repository = module.get<Repository<Users>>(getRepositoryToken(Users));
  });

  it('debería estar definido', () => {
    expect(usersService).toBeDefined();
  });

  it('debe retornar todos los usuario', async () => {
    const result = await usersService.getUsers(1, 10);
    expect(result).toEqual({
      total: mockUsers.length,
      users: mockUsers,
    });
  });

  it('debe encontrar un usuario por su email', async () => {
    const email = 'ana@example.com'; 
    const user = await usersService.getUserByIdentifier(email);
    expect(repository.findOne).toHaveBeenCalledWith({
        where: [
          { email },
          { user_name: email },
        ],
        relations: ['credentials'],
      });
  });

  it('debe devolver un usuario a partir de sú uuid', async () => {
    const uuid = '456';
    const user = await usersService.getUser(uuid);
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { uuid: '456' },
      select: ['uuid', 'email', 'name', 'user_name', 'country', 'profileImage', 'phone', 'address', 'role', 'banned'],
    });
  })

  it('debe crear un nuevo usuario', async () => {
    const data = {name: 'Juan Martín',
      email: 'juanmg@example.com'}
    
    const newUser = await usersService.create(data)

    expect(newUser).toHaveProperty('uuid');
    expect(newUser.name).toBe(data.name);
    expect(newUser.email).toBe(data.email);
  })

  it('debería actualizar un usuario sin password ni imagen', async () => {
    const uuid = '456';
    const userUpdate = { name: 'Nuevo Nombre', email: 'nuevo@example.com' };
            
    const result = await usersService.updateUser(uuid, userUpdate);
    
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { uuid },
      relations: ['credentials'],
    });
    
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
      uuid,
      name: 'Nuevo Nombre',
      email: 'nuevo@example.com',
    }));
  
    expect(result).not.toHaveProperty('password');
    expect(result.name).toBe('Nuevo Nombre');
  });

  it('debe crear un usuario y si es el primero, darle el rol de SUPERADMIN', async () => {
    const newUser = {
      name: 'Carlos',
      email: 'carlos@hotmail.com',
      password: 'carlitos',
    };
  
    jest.spyOn(usersService, 'getUsersCount').mockResolvedValue(0);
  
    const result = await usersService.addUser(newUser);
  
    expect(result).not.toHaveProperty('password');
  
    expect(result.role).toBe(Role.SUPERADMIN);
  });

  it('debe crear un usuario con rol USER si no es el primero', async () => {
    const newUser = {
      name: 'Ana',
      email: 'ana@hotmail.com',
      password: 'anita',
    };
  
    jest.spyOn(usersService, 'getUsersCount').mockResolvedValue(5);
  
    const result = await usersService.addUser(newUser);
  
    expect(result.role).toBe(Role.USER);
  });


});
