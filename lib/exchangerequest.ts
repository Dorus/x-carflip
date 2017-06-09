// Exchange request

import {ExchangeCommand} from './exchangecommand';

export class ExchangeRequest
{
  constructor (public readonly command: ExchangeCommand)
  {
  }
}
