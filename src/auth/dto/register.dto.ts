import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '닉네임은 필수 입력 항목입니다' })
  @MinLength(2, { message: '닉네임은 최소 2자 이상이어야 합니다' })
  @MaxLength(20, { message: '닉네임은 최대 20자 이하여야 합니다' })
  nickname: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호는 필수 입력 항목입니다' })
  @MinLength(4, { message: '비밀번호는 최소 4자 이상이어야 합니다' })
  @MaxLength(20, { message: '비밀번호는 최대 20자 이하여야 합니다' })
  // @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
  //   message: '비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.',
  // })
  password: string;
}
