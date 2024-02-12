interface Migration {
  upgrade(db: IDBDatabase): void;
}

export const migrations: Migration[] = [
  {
    upgrade(db: IDBDatabase) {
      if (!db.objectStoreNames.contains('settings')) {
        const store = db.createObjectStore('settings', { keyPath: 'name' });
        store.createIndex('name', 'name', { unique: true });
      }
    },
  },
  {
    upgrade(db: IDBDatabase) {
      if (!db.objectStoreNames.contains('chats')) {
        const store = db.createObjectStore('chats', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp');
      }
    },
  },
  {
    upgrade(db: IDBDatabase) {
      if (!db.objectStoreNames.contains('messages')) {
        const store = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('chatId', 'chatId');
      }
    },
  },
];