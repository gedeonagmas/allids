import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../guards/roles.guard';

type Role = 'USER' | 'ADMIN' | 'ORG';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

