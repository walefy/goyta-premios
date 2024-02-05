export interface IPassword {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
  compareSync(password: string, hash: string): boolean;
  hashSync(password: string): string;
}
