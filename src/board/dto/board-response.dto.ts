import { Board } from '../entities/board.entity';

export class BoardResponseDto {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userNickname: string;
  userEmail: string;

  private constructor(data: Partial<BoardResponseDto>) {
    Object.assign(this, data);
  }

  static from(board: Board): BoardResponseDto {
    return new BoardResponseDto({
      id: board.id,
      title: board.title,
      content: board.content,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
      userNickname: board.user.nickname,
      userEmail: board.user.email,
    });
  }

  static fromArray(boards: Board[]): BoardResponseDto[] {
    return boards.map((board) => this.from(board));
  }
}
