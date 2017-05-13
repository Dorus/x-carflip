// Car dealer exchange

import Car from './car';
import NetworkCoordinator from './networkcoordinator';
import {Observable} from '@reactivex/rxjs';

class ExchangeProxy
{
  private networkCoordinator: NetworkCoordinator;

  constructor ()
  {
    this.networkCoordinator = new NetworkCoordinator();
  }

  public commissionInfo$ (): Observable<any>
  {
    // Observables rely on a shared network request loop which repeatedly retrieves values on timers via web API.

    return Observable.timer(0, 3000).concatMap((x) => { return Observable.of(x) }); //placeholder
  }
  
  public inventory$ (): Observable<Array<Car>>
  {
    return Observable.timer(0, 2000).concatMap((x) => { return Observable.of([new Car(), new Car(), new Car()]) }); //placeholder
  }
}

export default ExchangeProxy;
