interface BaseRecord {
  id: number;
  timestamp: Date;
}

// Define the operations
type Operation = 'insert' | 'read';

// Adjusted DBType to take a type directly
export type DBType<Op extends Operation, T> =
  Op extends "insert" ? T & Partial<BaseRecord> :
  Op extends "read" ? T & BaseRecord :
  never;