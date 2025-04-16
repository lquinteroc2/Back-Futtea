import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { getLocalCredential } from 'src/utils/credential';



@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}


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
    };
  }
}
