import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class DatabaseService {
  constructor(@InjectEntityManager() private readonly entityManager: EntityManager) {}

  async executeRawQuery(query: string, params: any[] = []) {
    return await this.entityManager.query(query, params);
  }
}
