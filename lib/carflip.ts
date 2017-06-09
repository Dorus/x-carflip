// Carflip

import {Exchange} from './exchange';
import {Indicator} from './indicator';
import {MarketState} from './marketstate';
import {Observable} from '@reactivex/rxjs';

export class Carflip
{
  public readonly exchange: Exchange = new Exchange();

  private generateMarketState (...latestValues): MarketState
  {
    const v: MarketState = new Map();

    v.set(Indicator.CommissionInfo, latestValues[0]);
    v.set(Indicator.Inventory, latestValues[1]);

    return v;
  }

  private marketState$ (): Observable<MarketState>
  {
    const exchange: Exchange = this.exchange;

    return Observable.combineLatest([exchange.commissionInfo$(3000),
                                     exchange.inventory$(2000)],
                                    <(latestValues) => MarketState>this.generateMarketState.bind(this));
  }

  public trade$ (): Observable<any>
  {
    return this.marketState$();
  }
}
