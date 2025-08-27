
import { Db } from 'mongodb';

declare namespace mongoGetDb {
  type Callback = (err: Error | null, db?: Db) => void;

  interface GetDb {
    (alias: string, callback: Callback): void;
    (callback: Callback): void;
    (alias?: string): Promise<Db>;
    init(...args: any[]): void;
    legacyHapi: any;
  }
}

declare const mongoGetDb: mongoGetDb.GetDb;
export = mongoGetDb;
