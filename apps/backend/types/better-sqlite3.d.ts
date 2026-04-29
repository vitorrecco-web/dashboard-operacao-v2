declare module "better-sqlite3" {
  class Database {
    constructor(filename: string, options?: Database.Options);
    pragma(source: string): unknown;
    exec(source: string): this;
    prepare(source: string): Database.Statement;
    transaction<T extends (...args: any[]) => any>(fn: T): T;
  }

  namespace Database {
    interface Options {
      readonly?: boolean;
      fileMustExist?: boolean;
      timeout?: number;
      verbose?: (message?: unknown, ...optionalParams: unknown[]) => void;
    }

    interface RunResult {
      changes: number;
      lastInsertRowid: number | bigint;
    }

    interface Statement {
      run(...params: any[]): RunResult;
      get(...params: any[]): any;
      all(...params: any[]): any[];
    }

    type Database = globalThis.InstanceType<typeof Database>;
  }

  export = Database;
}
