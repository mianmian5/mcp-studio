export interface Server {
  id: string;
  name: string;
  description: string;
  github_url: string;
  homepage: string;
  stars: number;
  forks: number;
  license: string;
  language: string;
  topics: string[];
  categories: string[];
  last_push_at: string;
}

export interface ServerData {
  exportedAt: string;
  total: number;
  servers: Server[];
}
