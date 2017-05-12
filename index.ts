// Car dealer exchange client
// * Subscribe to market conditions through an exchange and trade cars.

import ExchangeProxy from './lib/exchangeproxy';
import {Observable} from '@reactivex/rxjs';

const exchangeProxy = new ExchangeProxy();

const marketConditions$ = () => Observable.merge(exchangeProxy.commissionInfo$, exchangeProxy.inventory$);
// Both observables should emit their first value before trades$ runs for the first time.

marketConditions$().concatMap(latestValues => tradeRequests$(latestValues)).subscribe();
// trades$ should be run with the latest value of each observable.

function tradeRequests$ (latestValues)
{
  //const commissionInfo = ...?
  //const inventory = ...?

  // Create trade requests for good trades using commissionInfo and inventory.

  return Observable.empty(); // Return array of trade requests.
}
