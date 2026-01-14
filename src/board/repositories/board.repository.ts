import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateBoardDto } from '../dto/create-board.dto';
import { UpdateBoardDto } from '../dto/update-board.dto';
import { Board } from '../entities/board.entity';

@Injectable()
export class BoardRepository {
  constructor(
    @InjectRepository(Board)
    private readonly repository: Repository<Board>,
  ) {}

  async create(createBoardDto: CreateBoardDto, user: User): Promise<Board> {
    const board = this.repository.create({ ...createBoardDto, user });
    return this.repository.save(board);
  }

  async findAllWithUsers(): Promise<Board[]> {
    return this.repository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByIdWithUser(id: number): Promise<Board | null> {
    return this.repository.findOne({ where: { id }, relations: ['user'] });
  }

  async update(board: Board, updateBoardDto: UpdateBoardDto): Promise<Board> {
    Object.assign(board, updateBoardDto);
    return this.repository.save(board);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
