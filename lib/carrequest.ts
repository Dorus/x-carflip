// Car request

import {Car} from './car';
import {CarRequestType} from './carrequesttype';

export class CarRequest
{
  constructor (public readonly car: Car, public readonly type: CarRequestType)
  {
  }
}
