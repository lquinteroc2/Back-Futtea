import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/users/entities/user.entity';


export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
