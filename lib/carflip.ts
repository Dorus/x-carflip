// Carflip

import {Car} from './car';
import {CarRequest} from './carrequest';
import {CarRequestResponse} from './carrequestresponse';
import {CarRequestType} from './carrequesttype';
import {Exchange} from './exchange';
import {Indicator} from './indicator';
import {MarketState} from './marketstate';
import {Observable} from '@reactivex/rxjs';
import {PriceRange} from './pricerange';

export class Carflip
{
  public readonly exchange: Exchange = new Exchange();

  private generateMarketState (...latestValues): MarketState
  {
    const v: MarketState = new Map();

    v.set(Indicator.CommissionInfo,
          latestValues[0]);
    v.set(Indicator.Inventory,
          latestValues[1]);

    return v;
  }

  private marketState$ (): Observable<MarketState>
  {
    const exchange: Exchange = this.exchange;

    return Observable.combineLatest([exchange.commissionInfo$(3),
                                     exchange.inventory$(1)],
                                    <(latestValues) => MarketState>this.generateMarketState
                                                                       .bind(this));
  }

  private carRequest$ (marketState: MarketState): Observable<CarRequest>
  {
    const commissionInfo = marketState.get(Indicator.CommissionInfo);
    const inventory: Array<Car> = marketState.get(Indicator.Inventory);

    const v: Array<CarRequest> = inventory.filter(car => car.priceRange
                                                  == PriceRange.Low)
                                          .map(car =>
                                               {
                                                 return new CarRequest(car,
                                                                       CarRequestType.Buy);
                                               });

    return Observable.from(v);
  }

  public trade$ (): Observable<any>
  {
    return this.marketState$()
               .concatMap(this.carRequest$);
               //.concatMap(this.exchange
               //               .carRequestResponse$
               //               .bind(this.exchange));

  }
}
