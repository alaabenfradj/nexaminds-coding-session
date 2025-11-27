const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Post {
  id: number;
  title: string;
  body: string;
  userId?: number;
}

export interface CreatePostData {
  title: string;
  body: string;
}

export interface PaginatedPostsResponse {
  data: Post[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function createPost(data: CreatePostData): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create post: ${response.statusText}`);
  }

  return response.json();
}

export async function getPosts(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedPostsResponse> {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
  const response = await fetch(`${API_BASE_URL}/posts?page=${page}&limit=${limit}${searchParam}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.statusText}`);
  }

  return response.json();
}

export async function getPost(id: string): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch post: ${response.statusText}`);
  }

  return response.json();
}

