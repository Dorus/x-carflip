// Car dealer exchange

import {Car} from './car';
import {ExchangeCommand} from './exchangecommand';
import {ExchangeCoordinator} from './exchangecoordinator';
import {ExchangeRequest} from './exchangerequest';
import {Observable} from '@reactivex/rxjs';

export class Exchange
{
  private readonly exchangeCoordinator: ExchangeCoordinator;

  constructor ()
  {
    this.exchangeCoordinator = new ExchangeCoordinator();
  }

  public commissionInfo$ (repeatRest: number): Observable<any>
  {
    return this.indicator$(ExchangeCommand.ReturnCommissionInfo, repeatRest);
  }

  private indicator$ (command: ExchangeCommand, repeatRest?: number): Observable<any>
  {
    return Observable.timer(0,
                            repeatRest)
                     .concatMap(x =>
                                {
                                  return this.exchangeCoordinator
                                             .exchangeRequestResponse$(new ExchangeRequest(command));
                                });
  }

  public inventory$ (repeatRest: number): Observable<Array<Car>>
  {
    return this.indicator$(ExchangeCommand.ReturnInventory, repeatRest);
  }
}
