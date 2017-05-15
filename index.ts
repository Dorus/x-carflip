// Car dealer exchange client

import ExchangeProxy from './lib/exchangeproxy';
import {Observable} from '@reactivex/rxjs';
import TradeRequest from './lib/traderequest';

const exchangeProxy = new ExchangeProxy();

const marketCondition$s = [exchangeProxy.commissionInfo$(3000),
                           exchangeProxy.inventory$(2000)];

const marketConditions$ = () => Observable.combineLatest(marketCondition$s,
                                                         (commissionInfo,
                                                          inventory) => ({"commissionInfo": commissionInfo,
                                                                          "inventory": inventory}));

marketConditions$().concatMap(marketConditions => tradeRequest$(marketConditions)) // Market conditions create trading opportunities.
                   .concatMap(tradeRequest => exchangeProxy.tradeRequestResponse$(tradeRequest)) // Trade requests are issued to the exchange.
                   .subscribe(); // Trade request responses are logged.

function tradeRequest$ (marketConditions: {}): Observable<TradeRequest>
{
  console.log(marketConditions['commissionInfo']);
  console.log(marketConditions['inventory']);

  // get cars from inventory and make a traderequest for each car with a low price range.

  return Observable.from([new TradeRequest(), new TradeRequest(), new TradeRequest(), new TradeRequest()]); //placeholder
}
