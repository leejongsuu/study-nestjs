export class SearchResultDto {
  id: number;
  title: string;
  content: string;
  userId: number;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
  score: number;
  highlight?: {
    title?: string[];
    content?: string[];
  };
}

export class SearchResponseDto {
  data: SearchResultDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
