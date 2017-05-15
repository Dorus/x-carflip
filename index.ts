// Car dealer exchange client

import {Car} from './lib/car';
import {ExchangeProxy} from './lib/exchangeproxy';
import {Observable} from '@reactivex/rxjs';
import {PriceRange} from './lib/car';
import {TradeRequest} from './lib/traderequest';

const commissionInfoDelay: number = 3000;
const inventoryDelay: number = 2000;

const enum MarketCondition
{
  CommissionInfo,
  Inventory
}

const exchangeProxy = new ExchangeProxy();

const marketCondition$s = [exchangeProxy.commissionInfo$(commissionInfoDelay),
                           exchangeProxy.inventory$(inventoryDelay)];

const marketConditions$ = () => Observable.combineLatest(marketCondition$s,
                                                         (commissionInfo,
                                                          inventory) => ({[MarketCondition.CommissionInfo]: commissionInfo,
                                                                          [MarketCondition.Inventory]: inventory}));

marketConditions$().concatMap(marketConditions => tradeRequest$(marketConditions)) // Market conditions create trading opportunities.
                   .concatMap(tradeRequest => exchangeProxy.tradeRequestResponse$(tradeRequest)) // Trade requests are issued to the exchange.
                   .subscribe(); // Trade request responses are logged.

function tradeRequest$ (marketConditions: {}): Observable<TradeRequest>
{
  const commissionInfo = marketConditions[MarketCondition.CommissionInfo];
  const inventory: Array<Car> = marketConditions[MarketCondition.Inventory];

  const v: Array<TradeRequest> = inventory.filter(car => car.priceRange == PriceRange.Low)
                                          .map(car => new TradeRequest(car));

  return Observable.from(v);
}
