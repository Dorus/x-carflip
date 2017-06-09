// Exchange coordinator

import Axios from 'axios';
import {AxiosPromise} from 'axios';
import {AxiosResponse} from 'axios';
import {Car} from './car';
import * as Crypto from 'crypto';
import {ExchangeCommand} from './exchangecommand';
import {ExchangeRequest} from './exchangerequest';
import {ExchangeRequestResponse} from './exchangerequestresponse';
import {Observable} from '@reactivex/rxjs';
import {PriceRange} from './pricerange';
import * as Querystring from 'querystring';

export class ExchangeCoordinator
{
  private readonly apiKey: string = 'LWHEHSLWH';
  private readonly apiSecret: string = '72946258352';
  private lastNonce: number = 0;

  private axiosPromise (data: any): AxiosPromise
  {
    const hmac: Crypto.Hmac = Crypto.createHmac('sha512', this.apiSecret);

    hmac.update(data, 'utf8');
    let hashedData: string = hmac.digest('hex');

    return Axios({
                   data: data,
                   headers:
                   {
                     'Key': this.apiKey,
                     'Sign': hashedData
                   },
                   method: 'post',
                   url: 'https://api.example.com'
                 });
  }

  public exchangeRequestResponse$ (exchangeRequest: ExchangeRequest): Observable<any>
  {
    const allParameters =
    {
      command: exchangeRequest.command,
      nonce: this.generateNextNonce()
    };

    console.log(`${new Date()} request with nonce ${allParameters.nonce}`);

    const data: string = Querystring.stringify(allParameters);

    return Observable.fromPromise(this.axiosPromise(data))
                     .catch((error) =>
                            {
                              if (typeof(error) !== 'string')
                              {
                                //console.log(error);
                                //console.log(`${new Date()} [NETWORK ERROR]`);
                              }
                              else if ((typeof(error) === 'string') && (error.indexOf('422') !== -1))
                              {
                                //console.log('422 Unprocessable Entity');
                                //console.log(error);
                                //console.log(`${new Date()} [NETWORK ERROR] ${error}`);
                              }
                              else
                              {
                                //console.log('Unhandled error condition');
                                //console.log(error);
                                //console.log(`${new Date()} [NETWORK ERROR]`);
                              }

                              return Observable.of(1);
                              //return Observable.empty();
                            })
                     .concatMap((response) =>
                          {
                            let v;

                            function isAxiosResponse (r: {} | AxiosResponse): r is AxiosResponse
                            {
                              return true;
                            }

                            if (isAxiosResponse(response))
                            {
                              if ((response.data) && (response.data.error))
                              {
                                console.log(`${new Date()} [API ERROR] ${response.data.error}`);
                                return Observable.empty();
                              }

                              if (exchangeRequest.command === ExchangeCommand.ReturnCommissionInfo)
                              {
                                v = { maker: .15, taker: .25 };
                              }
                              else if (exchangeRequest.command === ExchangeCommand.ReturnInventory)
                              {
                                v = [new Car(PriceRange.Low),
                                     new Car(PriceRange.Low),
                                     new Car(PriceRange.Low),
                                     new Car(PriceRange.Mid),
                                     new Car(PriceRange.High),
                                     new Car(PriceRange.High)];
                              }
                              else
                              {
                                console.log(`${new Date()} [API ERROR] Command ${exchangeRequest.command} not handled`);
                                return Observable.empty();
                              }
                            }

                            console.log(`${new Date()} [RESPONSE]`);
                            return Observable.of(v);
                          });
  }

  private generateNextNonce()
  {
    let v: number;
    const unixtime = Math.floor(Date.now() / 1000);

    if ((this.lastNonce === unixtime) || (this.lastNonce > unixtime))
    {
      v = this.lastNonce += 1;
    }
    else
    {
      v = unixtime;
    }

    this.lastNonce = v;

    return v;
  }
}
