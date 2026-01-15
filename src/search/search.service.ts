import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchBoardDto } from './dto/search-board.dto';
import { SearchResponseDto, SearchResultDto } from './dto/search-result.dto';

interface BoardDocument {
  id: number;
  title: string;
  content: string;
  userId: number;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ElasticsearchSearchResponse {
  hits: {
    total: number | { value: number };
    hits: Array<{
      _source: BoardDocument;
      _score: number;
      highlight?: { title?: string[]; content?: string[] };
    }>;
  };
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly index: string;

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly configService: ConfigService,
  ) {
    this.index = this.configService.get('ELASTICSEARCH_INDEX', 'boards');
  }

  // 검색
  async search(searchBoardDto: SearchBoardDto): Promise<SearchResponseDto> {
    const { query, page = 1, limit = 10 } = searchBoardDto;
    const from = (page - 1) * limit;

    try {
      const response = await this.elasticsearchService.search({
        index: this.index,
        body: {
          from,
          size: limit,
          query: {
            multi_match: {
              query,
              fields: ['title^3', 'content', 'userName'],
              fuzziness: 'AUTO',
            },
          },
          highlight: {
            fields: {
              title: {},
              content: {},
            },
            pre_tags: ['<mark>'],
            post_tags: ['</mark>'],
          },
          sort: [{ _score: 'desc' }, { createdAt: 'desc' }],
        },
      });

      const body = response.body as ElasticsearchSearchResponse;
      const hits = body.hits.hits;
      const total =
        typeof body.hits.total === 'number'
          ? body.hits.total
          : body.hits.total.value;

      const data: SearchResultDto[] = hits.map((hit) => ({
        id: hit._source.id,
        title: hit._source.title,
        content: hit._source.content,
        userId: hit._source.userId,
        userName: hit._source.userName,
        createdAt: hit._source.createdAt,
        updatedAt: hit._source.updatedAt,
        score: hit._score ?? 0,
        highlight: hit.highlight,
      }));

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Search failed: ${message}`);
      throw error;
    }
  }
}
