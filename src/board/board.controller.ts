import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { AuthenticatedUser } from 'src/auth/types/authenticated-user.type';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { BoardService } from './board.service';
import { BoardResponseDto } from './dto/board-response.dto';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Controller('/api/boards')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}
  @Post()
  createBoard(
    @Body() createBoardDto: CreateBoardDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BoardResponseDto> {
    return this.boardService.createBoard(createBoardDto, user.id);
  }

  @Public()
  @Get()
  getBoards(): Promise<BoardResponseDto[]> {
    return this.boardService.getBoards();
  }

  @Get(':id')
  getBoard(@Param('id', ParseIntPipe) id: number): Promise<BoardResponseDto> {
    return this.boardService.getBoard(id);
  }

  @Patch(':id')
  updateBoard(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBoardDto: UpdateBoardDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BoardResponseDto> {
    return this.boardService.updateBoard(id, updateBoardDto, user.id);
  }

  @Delete(':id')
  deleteBoard(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.boardService.deleteBoard(id, user.id);
  }
}
