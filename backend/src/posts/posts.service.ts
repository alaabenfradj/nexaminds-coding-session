import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PostsService {
  private apiUrl: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('POST_API') || '';
  }

  async getPosts() {
    const response = await axios.get(this.apiUrl);
    await this.delay(3000);
    return response.data;
  }

  async getPost(id: string) {
    const response = await axios.get(`${this.apiUrl}/${id}`);
    return response.data;
  }

  delay = (time: number) => {
    return new Promise((resolve) => setTimeout(resolve, time));
  };
}
