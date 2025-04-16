import { 
  Controller, Post, Body
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';




@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
              private readonly usersService: UsersService
  ) {}

  // ✅ Registro de usuario (Signup)
  @Post('/signup')
  signUp(@Body() user: CreateUserDto) {
    delete user.passwordConfirmation; // 🔥 Eliminamos la propiedad sin crear una variable extra
    return this.usersService.addUser(user);
  }

  // ✅ Inicio de sesión (Signin)
  @Post('/signin')
  signIn(@Body() credentials: LoginUserDto) {
    const { identifier, password } = credentials;
    return this.authService.signIn(identifier, password);
  }
}
