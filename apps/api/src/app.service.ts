import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getServerInfo(): any {
    return {
      "success":true,
      "message":"Seltra server is running....",
      "description":"The world's leading AI-native commerce stack.",
      "version":"1.0.0","year":2026};
  }
}
