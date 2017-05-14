// Car dealer exchange client

import ExchangeProxy from './lib/exchangeproxy';
import {Observable} from '@reactivex/rxjs';
import TradeRequest from './lib/traderequest';

const exchangeProxy = new ExchangeProxy();

const marketConditions$ = () => Observable.combineLatest([exchangeProxy.commissionInfo$(3000),
                                                          exchangeProxy.inventory$(2000)]); //, (commissionInfo, inventory) => ???`)
marketConditions$()
.concatMap(marketConditions => tradeRequest$(marketConditions)) // Market conditions create trading opportunities.
.concatMap(tradeRequest => exchangeProxy.tradeRequestResponse$(tradeRequest)) // Trade requests are issued to the exchange.
.subscribe(x => console.log(x)); // Trade request responses are logged.

function tradeRequest$ (marketConditions: Array<any>): Observable<TradeRequest>
{
  // get cars from inventory from marketConditions, make a traderequest for each car with a low price range.
  console.log(marketConditions);

  return Observable.from([new TradeRequest(), new TradeRequest(), new TradeRequest(), new TradeRequest()]); //placeholder
}
