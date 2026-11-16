import { IsOptional, IsString, IsUrl, Matches, MaxLength } from 'class-validator';

export class CreateLinkDto {
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  url: string;

  /** Alias personalizado opcional (3 a 32 caracteres: letras, numeros, - y _). */
  @IsOptional()
  @IsString()
  @MaxLength(32)
  @Matches(/^[A-Za-z0-9_-]{3,32}$/, { message: 'alias invalido' })
  alias?: string;
}
