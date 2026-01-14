import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ErrorMessages } from 'src/common/constants/error-messages';
import { UserService } from 'src/user/user.service';
import { BoardResponseDto } from './dto/board-response.dto';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardRepository } from './repositories/board.repository';

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);

  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly userService: UserService,
  ) {}

  private async findBoardOrThrow(id: number) {
    const board = await this.boardRepository.findByIdWithUser(id);
    if (!board) {
      throw new NotFoundException(ErrorMessages.BOARD.NOT_FOUND);
    }
    return board;
  }

  private validateOwner(boardUserId: number, requestUserId: number) {
    if (boardUserId !== requestUserId) {
      throw new UnauthorizedException(ErrorMessages.BOARD.UNAUTHORIZED);
    }
  }

  async createBoard(
    createBoardDto: CreateBoardDto,
    userId: number,
  ): Promise<BoardResponseDto> {
    const user = await this.userService.findUserById(userId);
    const board = await this.boardRepository.create(createBoardDto, user);
    this.logger.log(`Board created: ${board.id} by User ${userId}`);
    return BoardResponseDto.from(board);
  }

  async getBoards(): Promise<BoardResponseDto[]> {
    const boards = await this.boardRepository.findAllWithUsers();
    return BoardResponseDto.fromArray(boards);
  }

  async getBoard(id: number): Promise<BoardResponseDto> {
    const board = await this.findBoardOrThrow(id);
    return BoardResponseDto.from(board);
  }

  async updateBoard(
    id: number,
    updateBoardDto: UpdateBoardDto,
    userId: number,
  ): Promise<BoardResponseDto> {
    const board = await this.findBoardOrThrow(id);

    this.validateOwner(board.user.id, userId);

    Object.assign(board, updateBoardDto);
    const updatedBoard = await this.boardRepository.update(
      board,
      updateBoardDto,
    );
    this.logger.log(`Board updated: ${id} by User ${userId}`);
    return BoardResponseDto.from(updatedBoard);
  }

  async deleteBoard(id: number, userId: number): Promise<void> {
    const board = await this.findBoardOrThrow(id);

    this.validateOwner(board.user.id, userId);

    await this.boardRepository.delete(id);
    this.logger.log(`Board deleted: ${id} by User ${userId}`);
  }
}
