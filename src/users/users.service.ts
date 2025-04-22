import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, Users } from './entities/user.entity';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET } from 'src/config/env';
import { getLocalCredential } from 'src/utils/credential';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilesUploadRepository } from 'src/file-upload/file-upload.repository';
import { sendResetPasswordEmail, sendVerificationEmail } from 'src/utils/mailer';
import { Credential, CredentialType } from 'src/credential/entities/credential.entity';



@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) 
    private readonly usersRepository: Repository<Users>,
    private readonly filesRepository: FilesUploadRepository

  ) {}

  async getUsers(page: number, limit: number) {
    const [users, total] = await this.usersRepository.findAndCount({
      select: ['uuid', 'email', 'name','user_name','country','profileImage', 'phone', 'address', 'role', 'banned'], 
      skip: (page - 1) * limit,
      take: limit,
    });

    return { total, users };
  }

  async getUser(uuid: string) {
    const user = await this.usersRepository.findOne({
      where: { uuid },
      select: ['uuid', 'email', 'name', 'user_name', 'country', 'profileImage', 'phone', 'address', 'role', 'banned'],
    });

    if (!user) throw new BadRequestException('User not found');
    return user;
  }
  
  async create(data: Partial<Users>) {
  const user = this.usersRepository.create(data);
  return this.usersRepository.save(user);
}
   
  async addUser(user: Partial<Users> & { password: string }) {
    const { password, email, user_name, ...userData } = user;
    
    // Verificar si el email ya existe
    const existingUser = await this.usersRepository.findOne({
      where: [{ email }, { user_name }] // Verifica si el email o el user_name ya existe
    });
  
    if (existingUser) {
      const existingLocalCredential = getLocalCredential(existingUser.credentials);
    
      if (!existingLocalCredential) {
        throw new BadRequestException(
          'Ya existe una cuenta con este correo registrada mediante Google. Inicia sesión con Google.'
        );
      }
    
      throw new BadRequestException('El correo electrónico o el nombre de usuario ya están registrados');
    }
  
    // Verificar si este es el primer usuario
    const isFirstUser = await this.getUsersCount() === 0;
  
    // Si es el primer usuario, asignar el rol de SUPERADMIN
    const newUser = this.usersRepository.create({
      ...userData,
      email,
      user_name,
      role: isFirstUser ? Role.SUPERADMIN : Role.USER,
    });
  
    const savedUser = await this.usersRepository.save(newUser);
  
    const hashed = await bcrypt.hash(password, 10);
  
    const credential = new Credential();
    credential.user = savedUser;
    credential.type = CredentialType.LOCAL;
    credential.identifier = savedUser.email;
    credential.secretHash = hashed;
  
    await this.usersRepository.manager.save(credential);
  
    return this.omitSensitiveData(savedUser);
  }
  

  async updateUser(uuid: string, user: Partial<Users> & { password?: string }) {
    const existingUser = await this.usersRepository.findOne({
      where: { uuid },
      relations: ['credentials'],
    });
  
    if (!existingUser) throw new BadRequestException('User not found');
  
    // 🔐 Actualizar contraseña si se envía
    if (user.password) {
      const localCredential = getLocalCredential(existingUser.credentials);
      if (!localCredential) throw new BadRequestException('No se encontró una credencial local');
      localCredential.secretHash = await bcrypt.hash(user.password, 10);
      await this.usersRepository.manager.save(localCredential);
    }
  
    delete user.password;
    delete (user as any).passwordConfirmation;
  
    // 📷 Eliminar imagen anterior si viene una nueva
    if (user.profileImage && existingUser.profileImage) {
      try {
        await this.filesRepository.deleteImageFromCloudinary(existingUser.profileImage);
      } catch (err) {
        console.error('Error eliminando imagen anterior:', err);
      }
      existingUser.profileImage = user.profileImage;
    }
  
    Object.assign(existingUser, user);
    const updatedUser = await this.usersRepository.save(existingUser);
  
    return this.omitSensitiveData(updatedUser);
  }

  async updateMyProfile(userUUID: string, updateProfileDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { uuid: userUUID } });
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    Object.assign(user, updateProfileDto);
  
    return this.usersRepository.save(user);
  }

  async updateUserRole(uuid: string, role: Role) {
    const user = await this.usersRepository.findOneBy({ uuid });
    if (!user) throw new BadRequestException('Usuario no encontrado');

    user.role = role;
    await this.usersRepository.save(user);
    return { message: `Rol actualizado a ${role}` };
  }

  async toggleBanUser(uuid: string, ban: boolean) {
    const user = await this.usersRepository.findOneBy({ uuid });
    if (!user) throw new BadRequestException('Usuario no encontrado');
    
    user.banned = ban;
    await this.usersRepository.save(user);
    return { message: ban ? 'Usuario baneado' : 'Usuario desbaneado' };
  }

  async deleteUser(uuid: string) {
    const user = await this.usersRepository.findOneBy({ uuid });
    if (!user) throw new BadRequestException('User not found');
  
    await this.usersRepository.remove(user);
    return this.omitSensitiveData(user);
  }

  async getUserByIdentifier(identifier: string) {
    return this.usersRepository.findOne({
      where: [{ email: identifier }, { user_name: identifier }],
      relations: ['credentials'],
    });
  }

  private omitSensitiveData(user: Users) {
    const userWithoutSensitiveData = { ...user };
    delete userWithoutSensitiveData.credentials;
    return userWithoutSensitiveData;
  }

  async getUsersCount() {
    const count = await this.usersRepository.count();
    return count;
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (user.verificationCode !== code) throw new BadRequestException('Código incorrecto');
    if (user.verificationCodeExpiresAt && new Date() > user.verificationCodeExpiresAt)
      throw new BadRequestException('El código ha expirado');

    user.isVerified = true;
    user.verificationCode = '';
    user.verificationCodeExpiresAt = undefined;
    await this.usersRepository.save(user);

    return { message: 'Correo verificado correctamente' };
  }

  async resendVerificationCode(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (user.isVerified) throw new BadRequestException('Este usuario ya está verificado');

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.verificationCode = code;
    user.verificationCodeExpiresAt = expiresAt;
    await this.usersRepository.save(user);

    await sendVerificationEmail(user.email, code);
    return { message: 'Nuevo código de verificación enviado' };
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const token = jwt.sign({ userUUID: user.uuid }, JWT_SECRET, { expiresIn: '15m' });
    await sendResetPasswordEmail(user.email, token);
    return { message: 'Correo de restablecimiento enviado' };
  }

  async resetPassword(token: string, password: string) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const user = await this.usersRepository.findOne({
        where: { uuid: decoded.userUUID },
        relations: ['credentials'],
      });
  
      if (!user || !user.credentials || user.credentials.length === 0) {
        throw new NotFoundException('Usuario no encontrado');
      }
  
      const localCredential = getLocalCredential(user.credentials);
  
      if (!localCredential) {
        throw new NotFoundException('No se encontró una credencial de tipo local');
      }
  
      const hashed = await bcrypt.hash(password, 10);
      localCredential.secretHash = hashed;
  
      await this.usersRepository.manager.save(localCredential);
  
      return { message: 'Contraseña restablecida correctamente' };
    } catch (err) {
      console.log(err);
      throw new BadRequestException('Token inválido o expirado');
    }
  }
}
