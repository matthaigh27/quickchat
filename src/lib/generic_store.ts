import { DBType } from "./db_types";
import LocalDB from "./local_db";

export interface BaseRecord {
  id?: number;
  timestamp?: Date;
}

export interface StoreOperations<T> {
  findBy(columnName: string, value: any): Promise<T | undefined>;
  findManyBy(columnName: string, value: any): Promise<T[]>;
  all({ orderBy }: { orderBy?: string }): Promise<T[]>;
  add(record: T): Promise<IDBValidKey>;
  update(id: number, record: Partial<T>): Promise<void>;
  delete(id: number): Promise<void>;
}

export class GenericStore<T> implements StoreOperations<T> {
  constructor(private storeName: string) {}

  async get(id: any) {
    return LocalDB.get<DBType<"read", T>>(this.storeName, id);
  }

  async findBy(columnName: string, id: any) {
    return LocalDB.findBy<DBType<"read", T>>(this.storeName, columnName, id);
  }

  async findManyBy(columnName: string, value: any) {
    return LocalDB.findManyBy<DBType<"read", T>>(this.storeName, columnName, value);
  }

  async all({ orderBy }: { orderBy?: string } = {}) {
    return LocalDB.all<DBType<"read", T>>(this.storeName, orderBy);
  }

  async add(record: DBType<"insert", T>) {
    // Implementation using LocalDB.put with this.storeName and record
    return LocalDB.add(this.storeName, record);
  }

  async update(id: any, record: Partial<T>) {
    // Implementation using LocalDB.update with this.storeName, id, and record
    return LocalDB.update(this.storeName, id, record);
  }

  async delete(id: number) {
    // Implementation using LocalDB.delete with this.storeName and id
    return LocalDB.delete(this.storeName, id);
  }
}
