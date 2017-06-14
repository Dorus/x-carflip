// Car request response

import {CarRequest} from './carrequest';

export class CarRequestResponse
{
  constructor (public readonly carRequest: CarRequest, public readonly confirmed: boolean)
  {
  }
}
