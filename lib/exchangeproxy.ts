// Car dealer exchange

import Car from './car';
import NetworkCoordinator from './networkcoordinator';
import {Observable} from '@reactivex/rxjs';
import TradeRequest from './traderequest';

class ExchangeProxy
{
  private networkCoordinator: NetworkCoordinator;

  constructor ()
  {
    this.networkCoordinator = new NetworkCoordinator();
  }

  public commissionInfo$ (repeatDelay: number): Observable<any>
  {
    return Observable
           .timer(0, repeatDelay)
           .concatMap((x) => { return Observable.of(x) }); //placeholder
  }
  
  public inventory$ (repeatDelay: number): Observable<Array<Car>>
  {
    return Observable
           .timer(0, repeatDelay)
           .concatMap(() => { return Observable.of([new Car('low'),
                                                    new Car('mid'),
                                                    new Car('high')]) }); //placeholder
  }

  //additional observables...

  public tradeRequestResponse$ (tradeRequest: TradeRequest)
  {
    return Observable.empty();
  }
}

export default ExchangeProxy;
