import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CredentialService } from '../credential/credential.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/users/entities/user.entity';
import { CredentialType } from 'src/credential/entities/credential.entity';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let credentialService: CredentialService;
  let jwtService: JwtService;


  const mockUser = {
    uuid: 'uuid-123',
    email: 'test@example.com',
    user_name: 'testuser',
    role: Role.USER,
    banned: false,
    credentials: [
      { type: CredentialType.LOCAL, secretHash: 'hashedPassword' }
    ],
    notifications: [],
    verificationCode: '123456',
    verificationCodeExpiresAt: new Date(),
  };

  const mockSanitizedUser = {
    uuid: 'uuid-123',
    email: 'test@example.com',
    user_name: 'testuser',
    role: Role.USER,
    banned: false,
  };
  const mockUsersService = {
    getUserByIdentifier: jest.fn(),
  };

  const mockCredentialService = {
    findByTypeAndIdentifier: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: CredentialService, useValue: mockCredentialService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    credentialService = module.get<CredentialService>(CredentialService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();

  });

  it('lanza error si el usuario no existe', async () => {
    mockUsersService.getUserByIdentifier.mockResolvedValue(null);

    await expect(
      authService.signIn('noexiste@example.com', 'hashedPassword')
    ).rejects.toThrow(BadRequestException);
  });

  it('lanza error si el usuario está baneado', async () => {
    mockUsersService.getUserByIdentifier.mockResolvedValue({...mockUser, banned: true});
    await expect(authService.signIn('test@example.com', 'hashedPassword'))
      .rejects.toThrow('Tu cuenta ha sido suspendida. Contacta soporte.');
  });

  it('lanza error si no hay credencial local o secretHash', async () => {
    const userSinCredenciales = {...mockUser, credentials: []};
    mockUsersService.getUserByIdentifier.mockResolvedValue(userSinCredenciales);
    await expect(authService.signIn('test@example.com', 'hashedPassword'))
      .rejects.toThrow('Credenciales inválidas');
  });

  it('devuelve token y usuario sin datos sensibles', async () => {
    mockUsersService.getUserByIdentifier.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    mockJwtService.sign.mockReturnValue('fake-jwt-token');

  const result = await authService.signIn('test@example.com', 'hashedPassword');

  expect(result).toEqual({
    message: 'Inicio de sesión exitoso',
    token: 'fake-jwt-token',
    user: mockSanitizedUser,
  });
});
  
});
