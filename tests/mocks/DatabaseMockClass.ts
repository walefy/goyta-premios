import { IDatabase } from '../../src/interfaces/IDatabase';
import { vi } from 'vitest';

export class DatabaseMockClass implements IDatabase {
  connect = vi.fn().mockImplementation(() => Promise.resolve());
}
