import { DBType } from "./db_types";
import { GenericStore, type BaseRecord } from "./generic_store";
import { migrations } from "./migrations";

export interface ChatRecord {
  title: string;
}

export interface SettingRecord {
  name: string;
  value: string;
}

export interface MessageRecord {
  chatId: number;
  message: string;
  role: "user" | "assistant";
  content: string;
}

export default class LocalDB {
  public static settings = new GenericStore<SettingRecord>("settings");
  public static chats = new GenericStore<ChatRecord>("chats");
  public static messages = new GenericStore<MessageRecord>("messages");

  private static db: IDBDatabase | null = null;

  private static async init(): Promise<IDBDatabase> {
    if (this.db) {
      return Promise.resolve(this.db);
    }
    const version = migrations.length;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open("local", version);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        console.log("Upgrading database...");
        const db = (event.target as IDBOpenDBRequest).result;
        migrations.forEach((migration, index) => {
          if (event.oldVersion < index + 1) {
            migration.upgrade(db);
          }
        });
      };

      request.onsuccess = (event: Event) => {
        LocalDB.db = (event.target as IDBOpenDBRequest).result;
        resolve(LocalDB.db);
      };

      request.onerror = (event: Event) => {
        reject("IndexedDB error: " + (event.target as IDBOpenDBRequest).error?.toString());
      };
    });
  }

  // TODO: update settings_dialog
  static async get<T>(storeName: string, value: any): Promise<DBType<"read", T> | undefined> {
    const db = await LocalDB.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => {
        console.error(e);
        reject(request.error);
      };
    });
  }

  static async findBy<T>(storeName: string, columnName: string, value: any): Promise<DBType<"read", T> | undefined> {
    const db = await LocalDB.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const index = store.index(columnName); // Use the index for the column
      const request = index.get(value); // Query by the value
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => {
        console.error(e);
        reject(request.error);
      };
    });
  }

  static async findManyBy<T>(storeName: string, columnName: string, value: any): Promise<DBType<"read", T>[]> {
    const db = await LocalDB.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const index = store.index(columnName); // Use the index for the column
      const request = index.getAll(value); // Get all records matching the value
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => {
        console.error(e);
        reject(request.error);
      };
    });
  }

  static async all<T>(storeName: string, orderBy?: string): Promise<DBType<"read", T>[]> {
    const db = await LocalDB.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const index = orderBy ? store.index(orderBy) : store;
      const request = index.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => {
        console.error(e);
        reject(request.error);
      };
    });
  }

  static async add<T extends BaseRecord>(storeName: string, record: T): Promise<IDBValidKey> {
    const db = await LocalDB.init();
    if (!record.timestamp) {
      record.timestamp = new Date();
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.add(record);
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => {
        console.error(e);
        reject(request.error);
      };
    });
  }

  static async update<T extends BaseRecord>(storeName: string, id: any, record: Partial<T>): Promise<void> {
    const db = await LocalDB.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      request.onsuccess = () => {
        const data = request.result;
        if (data) {
          Object.assign(data, record);
          store.put(data);
        }
        resolve();
      };
      request.onerror = (e) => {
        console.error(e);
        reject(request.error);
      };
    });
  }

  static async delete(storeName: string, id: number): Promise<void> {
    const db = await LocalDB.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = (e) => {
        console.error(e);
        reject(request.error);
      };
    });
  }
}
