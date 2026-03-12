import { User } from '../types';

export const checkPermission = (user: User | null, requiredRoles: string[]): boolean => {
  if (!user) return false;
  return requiredRoles.includes(user.roleUser);
};
