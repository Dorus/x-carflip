// Car dealer exchange client

import {Car} from './lib/car';
import {ExchangeProxy} from './lib/exchangeproxy';
import {Observable} from '@reactivex/rxjs';
import {MarketCondition} from './lib/marketcondition';
import {PriceRange} from './lib/car';
import {TradeRequest} from './lib/traderequest';

const commissionInfoDelay: number = 3000;
const exchangeProxy = new ExchangeProxy();
const inventoryDelay: number = 2000;

const marketConditions: Array<MarketCondition> = [MarketCondition.CommissionInfo, MarketCondition.Inventory];

const marketConditions$ = () => Observable.combineLatest(marketCondition$s(marketConditions),
                                                         (...args) =>
                                                         {
                                                           const v: {} = {};
                                                           
                                                           args.forEach((arg, index) => v[marketConditions[index]] = arg );
                                                           
                                                           return v;
                                                         });

marketConditions$().concatMap(latestValues => tradeRequest$(latestValues)) // Market conditions create trading opportunities.
                   .concatMap(tradeRequest => exchangeProxy.tradeRequestResponse$(tradeRequest)) // Trade requests are issued to the exchange.
                   .subscribe(); // Trade request responses are logged.

function tradeRequest$ (latestValues: {}): Observable<TradeRequest>
{
  const commissionInfo = latestValues[MarketCondition.CommissionInfo];
  const inventory: Array<Car> = latestValues[MarketCondition.Inventory];

  const v: Array<TradeRequest> = inventory.filter(car => car.priceRange == PriceRange.Low)
                                          .map(car => new TradeRequest(car));

  return Observable.from(v);
}

function marketCondition$s (marketConditions: Array<MarketCondition>)
{
  let v: Array<Observable<any>> = [];

  marketConditions.forEach(marketCondition =>
  {
    switch (marketCondition)
    {
      case MarketCondition.CommissionInfo:
        v.push(exchangeProxy.commissionInfo$(commissionInfoDelay));
        break;

      case MarketCondition.Inventory:
        v.push(exchangeProxy.inventory$(inventoryDelay));
        break;

      default:
        console.log('Unrecognized MarketCondition');
    }
  });

  return v;
}
