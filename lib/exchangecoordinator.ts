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
import {Observer} from '@reactivex/rxjs';
import {PriceRange} from './pricerange';
import * as Querystring from 'querystring';
import {Subject} from '@reactivex/rxjs';

export class ExchangeCoordinator
{
  private readonly apiKey: string = 'LWHEHSLWH';
  private readonly apiSecret: string = '72946258352';
  private lastNonce: number = 0;
  private readonly taskQueue = new Subject<Task>();
  private taskQueueSize: number = 0;
  private readonly taskQueue$ = this.taskQueue
                                    .do(() =>
                                    {
                                      this.taskQueueSize++;
                                      console.log(`queue size ${this.taskQueueSize}`);
                                      if (this.taskQueueSize > 3)
                                      {
                                        console.log(`${new Date()} [INFO] Task queue exceeds normal maximum`);
                                      }
                                    })
                                    .concatMap(task =>
                                        {
                                          return Observable.defer(() =>
                                           {
                                             if (task.observer
                                                     .closed)
                                             {
                                               return Observable.empty();
                                             }

                                            const allParameters =
                                            {
                                              command: task.exchangeRequest.command,
                                              nonce: this.generateNextNonce()
                                            };

                                            console.log(`${new Date()} request with nonce ${allParameters.nonce}`);

                                            Object.assign(allParameters,
                                                          task.exchangeRequest.parameters);

                                            const data: string = Querystring.stringify(allParameters);

                                             return Observable.fromPromise(this.axiosPromise(data))
                                                              .do(() => console.log(`${new Date()} request with nonce ${allParameters.nonce} done`))
                                                              .catch(error =>
                                                                     {
                                                                       task.observer
                                                                           .error(error);
                                                                       return Observable.empty();
                                                                     })
                                                  });
                                           },
                                           (task,
                                            response) => ({response,
                                                           observer: task.observer}))
                                    .do(() =>
                                    {
                                      this.taskQueueSize--;
                                    })
                                    .subscribe(({response,
                                             observer}) =>
                                             {
                                               observer.next(response); observer.complete();
                                             });

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

  public exchangeRequestResponse$ (exchangeRequest: ExchangeRequest): Observable<ExchangeRequestResponse>
  {
    return this.getApiData(exchangeRequest)
                     .catch((error) =>
                            {
                              let errorSummary: string = '';

                              if ((error)
                                  && (error.response)
                                  && (error.response.data)
                                  && (error.response.data.error))
                              {
                                errorSummary = error.response.data.error;
                              }

                              if ((errorSummary === '') && (error.message))
                              {
                                errorSummary = error.message;
                              }

                              if (typeof(error) !== 'string')
                              {
                                console.log(`${new Date()} [NETWORK ERROR] ${errorSummary}`);
                              }
                              else if ((typeof(error) === 'string') && (error.indexOf('422') !== -1))
                              {
                                console.log('422 Unprocessable Entity');
                                console.log(`${new Date()} [NETWORK ERROR] ${errorSummary}`);
                              }
                              else
                              {
                                console.log('Unhandled error condition');
                                console.log(`${new Date()} [NETWORK ERROR] ${errorSummary}`);
                              }

                              //return Observable.of(1); //placeholder
                              return Observable.empty();
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
                                console.log(`${new Date()} [API ERROR] ${response.data
                                                                                 .error}`);
                                return Observable.empty();
                              }

                              /*if (exchangeRequest.command === ExchangeCommand.Buy)
                              {
                                v = true;
                              }
                              else*/ if (exchangeRequest.command === ExchangeCommand.ReturnCommissionInfo)
                              {
                                v = { maker: .15,
                                      taker: .25 }; //placeholder
                              }
                              else if (exchangeRequest.command === ExchangeCommand.ReturnInventory)
                              {
                                v = [new Car(PriceRange.Low),
                                     new Car(PriceRange.Low),
                                     new Car(PriceRange.Low),
                                     new Car(PriceRange.Mid),
                                     new Car(PriceRange.High),
                                     new Car(PriceRange.High)]; //placeholder
                              }
                              else
                              {
                                console.log(`${new Date()} [API ERROR] Command ${exchangeRequest.command} not handled`);
                                return Observable.empty();
                              }
                            }

                            console.log(`${new Date()} [RESPONSE]`);
                            return Observable.of(new ExchangeRequestResponse(exchangeRequest, v));
                          });
  }

  private generateNextNonce()
  {
    let v: number;
    const unixtime = Date.now();

    if ((this.lastNonce === unixtime) || (this.lastNonce > unixtime))
    {
      v = this.lastNonce + 1;
      console.log(`${new Date()} [INFO] Needed to increment generated nonce`);
    }
    else
    {
      v = unixtime;
    }

    this.lastNonce = v;

    return v;
  }

  private getApiData (exchangeRequest: ExchangeRequest)
  {
    return Observable.create(observer =>
                              {
                                this.taskQueue.next({observer,
                                                     exchangeRequest});
                              });
  }
}

class Task
{
  observer: Observer<any>;
  exchangeRequest: ExchangeRequest;
}