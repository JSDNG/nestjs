import { IsEmail, IsOptional, IsString, IsBoolean, IsInt, IsDate } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    username?: string;

    @IsString()
    password: string;

    @IsOptional()
    @IsString()
    imgName?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsBoolean()
    isActive: boolean;

    @IsString()
    codeId: string;

    @IsDate()
    codeExpired: Date;

    @IsOptional()
    @IsString()
    refreshToken?: string;

    @IsInt()
    roleId: number;
}
