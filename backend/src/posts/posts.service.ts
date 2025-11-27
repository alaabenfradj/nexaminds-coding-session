import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PostsService {
  private apiUrl: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('POST_API') || '';
    if (!this.apiUrl) {
      throw new Error('POST_API environment variable is not set');
    }
  }

  async getPosts(page: number = 1, limit: number = 10, search?: string) {
    try {
      const response = await axios.get(this.apiUrl);
      await this.delay(3000);
      
      let allPosts = response.data;
    
      // Apply search filter if provided
      if (search && Array.isArray(allPosts)) {
        const searchLower = search.toLowerCase().trim();
        allPosts = allPosts.filter((post: any) => {
          const titleMatch = post.title?.toLowerCase().includes(searchLower);
          const bodyMatch = post.body?.toLowerCase().includes(searchLower);
          return titleMatch || bodyMatch;
        });
      }
      
      const total = Array.isArray(allPosts) ? allPosts.length : 0;
      
      // Handle pagination on our side since external API may not support it
      if (Array.isArray(allPosts)) {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedPosts = allPosts.slice(startIndex, endIndex);
        
        return {
          data: paginatedPosts,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        };
      }
      
      return {
        data: allPosts,
        meta: {
          total: 1,
          page,
          limit,
          totalPages: 1,
        },
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          `Failed to fetch posts from external API: ${error.message}`,
          error.response?.status || HttpStatus.BAD_GATEWAY,
        );
      }
      throw new HttpException(
        'An unexpected error occurred while fetching posts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPost(id: string) {
    try {
      const response = await axios.get(`${this.apiUrl}/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
        }
        throw new HttpException(
          `Failed to fetch post: ${error.message}`,
          error.response?.status || HttpStatus.BAD_GATEWAY,
        );
      }
      throw new HttpException(
        'An unexpected error occurred while fetching post',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createPost(createPostDto: { title: string; body: string }) {
    try {
      const response = await axios.post(this.apiUrl, {
        title: createPostDto.title,
        body: createPostDto.body,
        userId: 1, // Default userId, can be made dynamic later
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          `Failed to create post: ${error.message}`,
          error.response?.status || HttpStatus.BAD_GATEWAY,
        );
      }
      throw new HttpException(
        'An unexpected error occurred while creating post',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePost(id: string, updatePostDto: { title?: string; body?: string }) {
    try {
      // First get the existing post to merge with updates
      const existingPost = await this.getPost(id);
      
      // Merge existing data with updates (only provided fields)
      const updatedData = {
        ...existingPost,
        ...updatePostDto,
      };
      
      const response = await axios.patch(`${this.apiUrl}/${id}`, updatedData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
        }
        throw new HttpException(
          `Failed to update post: ${error.message}`,
          error.response?.status || HttpStatus.BAD_GATEWAY,
        );
      }
      throw new HttpException(
        'An unexpected error occurred while updating post',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  delay = (time: number) => {
    return new Promise((resolve) => setTimeout(resolve, time));
  };
}
