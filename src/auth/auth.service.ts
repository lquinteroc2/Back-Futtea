import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { getLocalCredential } from 'src/utils/credential';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { CredentialType } from '../credential/entities/credential.entity';
import { CredentialService } from 'src/credential/credential.service';
import { AppleAuthDto } from './dto/apple-auth.dto';
import { Users } from 'src/users/entities/user.entity';

interface AppleIdTokenPayload {
  email: string;
  sub: string;
  [key: string]: any;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private credentialService: CredentialService,
    private jwtService: JwtService,
  ) {}

  
  // Función para decodificar JWT manualmente
  private decodeJwt(token: string): AppleIdTokenPayload {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(jsonPayload) as AppleIdTokenPayload; // Afirmación de tipo
  }
  private sanitizeUser(user: Users) {
    // Creamos una copia del objeto user sin las propiedades no deseadas
    const userWithoutSensitiveData = { ...user };
    
    // Eliminamos las propiedades que no son necesarias
    delete userWithoutSensitiveData.credentials;
    delete userWithoutSensitiveData.notifications;
    delete userWithoutSensitiveData.verificationCode;
    delete userWithoutSensitiveData.verificationCodeExpiresAt;
    
    return userWithoutSensitiveData;
  }

  async signIn(identifier: string, password: string) {
    const foundUser = await this.usersService.getUserByIdentifier(identifier);
  
    if (!foundUser) {
      throw new BadRequestException('Credenciales inválidas');
    }
  
    if (foundUser.banned) {
      throw new BadRequestException('Tu cuenta ha sido suspendida. Contacta soporte.');
    }
  
    const localCredential = getLocalCredential(foundUser.credentials);
  
    if (!localCredential || !localCredential.secretHash) {
      throw new BadRequestException('Credenciales inválidas');
    }
  
    const isPasswordValid = await bcrypt.compare(password, localCredential.secretHash);
  
    if (!isPasswordValid) {
      throw new BadRequestException('Credenciales inválidas');
    }
    
    const sanitizedUser = this.sanitizeUser(foundUser);

    const userPayload = {
      uuid: foundUser.uuid,
      email: foundUser.email,
      user_name: foundUser.user_name,
      role: foundUser.role,
    };
  
    const token = this.jwtService.sign(userPayload);
  
    return {
      message: 'Inicio de sesión exitoso',
      token,
      user: sanitizedUser,
    };
  }

  async googleLogin(dto: GoogleAuthDto) {
    // Buscar credencial de tipo GOOGLE por el email
    const credential = await this.credentialService.findByTypeAndIdentifier(
      CredentialType.GOOGLE,
      dto.email,
    );

    let user;

    if (credential) {
      user = credential.user;
    } else {
      // Crear usuario
      const userName = dto.email.split('@')[0];

      user = await this.usersService.create({
        name: dto.name,
        email: dto.email,
        user_name: userName,
        profileImage: dto.image,
        isVerified: true,
      });

      // Crear credencial
      await this.credentialService.create({
        type: CredentialType.GOOGLE,
        identifier: dto.email,
        user,
      });
    }

    // Generar token
    const token = this.jwtService.sign({
      sub: user.uuid,
      email: user.email,
    });

    return {
      message: 'User authenticated with Google',
      user,
      token,
    };
  }

  async appleLogin(dto: AppleAuthDto) {
    let decodedToken: AppleIdTokenPayload;
    try {
      decodedToken = this.decodeJwt(dto.idToken);
    } catch {
      throw new BadRequestException('Token de Apple inválido');
    }
  
    const email = decodedToken.email;
    const sub = decodedToken.sub; // identificador único de Apple
  
    if (!email || !sub) {
      throw new BadRequestException('No se pudo obtener información del usuario de Apple');
    }
  
    const credential = await this.credentialService.findByTypeAndIdentifier(
      CredentialType.APPLE,
      sub,
    );
  
    let user;
  
    if (credential) {
      user = credential.user;
    } else {
      const userName = email.split('@')[0];
  
      user = await this.usersService.create({
        name: userName,
        email,
        user_name: userName,
        isVerified: true,
      });
  
      await this.credentialService.create({
        type: CredentialType.APPLE,
        identifier: sub,
        user,
      });
    }
  
    const token = this.jwtService.sign({
      sub: user.uuid,
      email: user.email,
    });
  
    return {
      message: 'User authenticated with Apple',
      user,
      token,
    };
  }
}
