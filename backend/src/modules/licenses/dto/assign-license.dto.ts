import { IsNotEmpty, IsString } from 'class-validator';

export class AssignLicenseDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
