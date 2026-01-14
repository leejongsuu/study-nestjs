import { Role } from 'src/user/types/role.enum';

export class AuthenticatedUser {
  id: number;
  email: string;
  role: Role;
}
