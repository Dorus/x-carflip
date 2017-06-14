// Car dealer exchange

import {Car} from './car';
import {CarRequest} from './carrequest';
import {CarRequestResponse} from './carrequestresponse';
import {CarRequestType} from './carrequesttype';
import {ExchangeCommand} from './exchangecommand';
import {ExchangeCoordinator} from './exchangecoordinator';
import {ExchangeRequest} from './exchangerequest';
import {Observable} from '@reactivex/rxjs';

export class Exchange
{
  private readonly exchangeCoordinator: ExchangeCoordinator;

  public carRequestResponse$ (carRequest: CarRequest): Observable<CarRequestResponse>
  {
    let exchangeCommand: ExchangeCommand;
    
    if (carRequest.type === CarRequestType.Buy)
    {
      exchangeCommand = ExchangeCommand.Buy;
    }
    else
    {
      console.log(`${new Date()} [ ERROR] Car request type ${carRequest.type} not handled`);
      return Observable.empty();
    }

    return this.exchangeCoordinator
               .exchangeRequestResponse$(new ExchangeRequest(exchangeCommand,
                                                             {car: carRequest.car}))
               .concatMap(exchangeRequestResponse => Observable.of(new CarRequestResponse(carRequest,
                                                                                          exchangeRequestResponse.value)));
  }

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
                     .concatMap(tick =>
                                {
                                  return this.exchangeCoordinator
                                             .exchangeRequestResponse$(new ExchangeRequest(command))
                                             .concatMap(exchangeRequestResponse => Observable.of(exchangeRequestResponse.value));
                                });
  }

  public inventory$ (repeatRest: number): Observable<Array<Car>>
  {
    return this.indicator$(ExchangeCommand.ReturnInventory, repeatRest);
  }
}
