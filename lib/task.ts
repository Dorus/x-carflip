// Exchange request task

import {ExchangeRequest} from './exchangerequest';
import {Observer} from '@reactivex/rxjs';

export class Task
{
  constructor (public readonly observer: Observer<any>, public readonly exchangeRequest: ExchangeRequest)
  {
  }
}
