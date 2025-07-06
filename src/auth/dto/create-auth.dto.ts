import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { PasswordMatch } from '../decorators/password-match.decorator';

export class CreateAuthDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  @PasswordMatch('password')
  confirmPassword: string;
}