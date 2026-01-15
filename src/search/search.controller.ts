import { Controller, Get, Query } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { SearchBoardDto } from './dto/search-board.dto';
import { SearchResponseDto } from './dto/search-result.dto';
import { SearchService } from './search.service';

@Controller('/api/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get('boards')
  searchBoards(
    @Query() searchBoardDto: SearchBoardDto,
  ): Promise<SearchResponseDto> {
    return this.searchService.search(searchBoardDto);
  }
}
