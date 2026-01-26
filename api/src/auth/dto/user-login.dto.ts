import { IsString, Matches } from 'class-validator';

export class UserLoginDto {
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'phone must be a valid phone number',
  })
  phone: string;
}

