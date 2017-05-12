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

    return Observable.empty();
  }
  
  public inventory$ (): Observable<Array<Car>>
  {
    return Observable.empty();
  }
}

export default ExchangeProxy;
