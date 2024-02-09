export interface IPrize {
  name: string;
  drawNumber: string;
  description: string;
  images: string[];
  equivalentPrice: number;
}

export type IPrizeWithoutDrawNumber = Omit<IPrize, 'drawNumber'>;

