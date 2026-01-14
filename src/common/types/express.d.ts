import { AuthenticatedUser } from 'src/auth/types/authenticated-user.type';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
