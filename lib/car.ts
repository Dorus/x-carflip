// Car

export class Car
{
  constructor (public readonly priceRange: PriceRange)
  {
  }
}

export enum PriceRange
{
  Low,
  Mid,
  High
}
