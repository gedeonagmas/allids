export class AuthResponseDto {
  id: string;
  phone?: string;
  username?: string;
  role: 'USER' | 'ADMIN' | 'ORG';
  status?: 'VERIFIED' | 'UNVERIFIED' | 'FREEZ';
}

