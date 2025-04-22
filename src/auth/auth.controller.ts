import { 
  Controller, Post, Body
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { AppleAuthDto } from './dto/apple-auth.dto';




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

  @Post('google')
  googleAuth(@Body() dto: GoogleAuthDto) {
    return this.authService.googleLogin(dto);
  }

  @Post('apple')
  appleAuth(@Body() dto: AppleAuthDto) {
  return this.authService.appleLogin(dto);
}
}
