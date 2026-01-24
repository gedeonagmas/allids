import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return (this.prisma as any).user.create({ data: createUserDto });
  }

  findAll() {
    return (this.prisma as any).user.findMany();
  }

  findOne(id: string) {
    return (this.prisma as any).user.findUnique({ where: { id } });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return (this.prisma as any).user.update({ where: { id }, data: updateUserDto });
  }

  remove(id: string) {
    return (this.prisma as any).user.delete({ where: { id } });
  }
}
