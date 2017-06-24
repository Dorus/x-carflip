// Exchange coordinator
import Axios from 'axios';
import { AxiosPromise } from 'axios';
import { AxiosResponse } from 'axios';
import { Car } from './car';
import * as Crypto from 'crypto';
import { ExchangeCommand } from './exchangecommand';
import { ExchangeRequest } from './exchangerequest';
import { ExchangeRequestResponse } from './exchangerequestresponse';
import { Observable } from '@reactivex/rxjs';
import { Observer } from '@reactivex/rxjs';
import { PriceRange } from './pricerange';
import * as Querystring from 'querystring';
import { Subject } from '@reactivex/rxjs';
import { Task } from './task';

export class ExchangeCoordinator {
  private readonly apiKey: string = 'LWHEHSLWH';
  private readonly apiSecret: string = '72946258352';
  private duplicateIdentifiers: Array < string > = [];
  private lastNonce: number = 0;
  private readonly taskQueue = new Subject < Task > ();
  private taskQueueSize: number = 0;
  private readonly taskQueue$ = this.taskQueue
    .concatMap((task) => {
        if (task.observer.closed) {
          return Observable.empty();
        }
        return task.project()
          .catch(error => {
            task.observer.error(error);
            return Observable.empty();
          })
      },
      (task, response) => new TaskResponse(response, task)
    ).subscribe({ next: (taskResponse) => taskResponse.task
        .observer.next(taskResponse.response),
      complete: () => taskResponse.task
        .observer.complete()
    });
  private addDuplicateIdentifier(duplicateIdentifier ? : string) {
    if (duplicateIdentifier) {
      this.duplicateIdentifiers
        .push(duplicateIdentifier);
    }
  }
  private decrementTaskQueue() {
    this.taskQueueSize--;
    console.log(`${new Date()} dequeue size ${this.taskQueueSize}`);
  }
  private enqueueRequest$(exchangeRequest: ExchangeRequest, duplicateIdentifier ? : string): Observable < AxiosResponse > {
    return Observable.create((observer) => {
      const task = new Task(observer,
        () => {
          const nextNonce: number = generateNextNonce(this.lastNonce);
          this.lastNonce = nextNonce;
          const allParameters = {
            command: exchangeRequest.command,
            nonce: nextNonce
          };
          console.log(`${new Date()} request with nonce ${allParameters.nonce}`);
          Object.assign(allParameters,
            exchangeRequest.parameters);
          const data: string = Querystring.stringify(allParameters);
          return Observable.fromPromise(generateAxiosPromise(this.apiKey,
              this.apiSecret,
              data))
            .do(() => console.log(`${new Date()} request with nonce ${allParameters.nonce} done`))
        });
      this.addDuplicateIdentifier(duplicateIdentifier);
      this.incrementTaskQueue();
      this.taskQueue
        .next(task);
      return () => {
        this.decrementTaskQueue();
        this.removeDuplicateIdentifier(duplicateIdentifier);
      };
    })
  }
  public exchangeRequestResponse$(exchangeRequest: ExchangeRequest, duplicateIdentifier ? : string): Observable < ExchangeRequestResponse > {
    if ((duplicateIdentifier) &&
      (this.duplicateIdentifiers
        .includes(duplicateIdentifier))) {
      console.log(`${new Date()} [INFO] Skipping task enqueue for duplicate identifier ${duplicateIdentifier}`);
      return Observable.empty();
    } else {
      return this.enqueueRequest$(exchangeRequest,
          duplicateIdentifier)
        .catch(this.requestError$)
        .concatMap((response) => {
          return requestResponse$(exchangeRequest,
            response);
        });
    }
  }
  private incrementTaskQueue() {
    this.taskQueueSize++;
    console.log(`${new Date()} enqueue size ${this.taskQueueSize}`);
    if (this.taskQueueSize > 5) {
      console.log(`${new Date()} [INFO] Task queue exceeds normal maximum (${this.taskQueueSize})`);
    }
  }
  private removeDuplicateIdentifier(duplicateIdentifier ? : string) {
    if (duplicateIdentifier) {
      const newDuplicateIdentifiers: Array < string > = this.duplicateIdentifiers
        .filter(e => e != duplicateIdentifier);
      this.duplicateIdentifiers = newDuplicateIdentifiers;
    }
  }
  private requestError$(error) {
    let errorSummary: string = '';
    if ((error) &&
      (error.response) &&
      (error.response
        .data) &&
      (error.response
        .data
        .error)) {
      errorSummary = error.response
        .data
        .error;
    }
    if ((errorSummary === '') &&
      (error.message)) {
      errorSummary = error.message;
    }
    if (typeof(error) !== 'string') {
      console.log(`${new Date()} [NETWORK ERROR] ${errorSummary}`);
    } else if ((typeof(error) === 'string') &&
      (error.indexOf('422') !== -1)) {
      console.log('422 Unprocessable Entity');
      console.log(`${new Date()} [NETWORK ERROR] ${errorSummary}`);
    } else {
      console.log('Unhandled error condition');
      console.log(`${new Date()} [NETWORK ERROR] ${errorSummary}`);
    }
    return Observable.empty();
  }
}

function generateAxiosPromise(apiKey: string, apiSecret: string, data: any): AxiosPromise {
  const hmac: Crypto.Hmac = Crypto.createHmac('sha512',
    apiSecret);
  hmac.update(data,
    'utf8');
  let hashedData: string = hmac.digest('hex');
  return Axios({
    data: data,
    headers: {
      'Key': apiKey,
      'Sign': hashedData
    },
    method: 'post',
    url: 'https://api.example.com'
  });
}

function generateNextNonce(lastNonce: number): number {
  let v: number;
  const unixtime = Date.now();
  if ((lastNonce === unixtime) ||
    (lastNonce > unixtime)) {
    v = lastNonce + 1;
    console.log(`${new Date()} [INFO] Needed to increment generated nonce`);
  } else {
    v = unixtime;
  }
  return v;
}

function requestResponse$(exchangeRequest: ExchangeRequest, response: {}): Observable < ExchangeRequestResponse > {
  let v;

  function isAxiosResponse(r: {} | AxiosResponse): r is AxiosResponse {
    return true;
  }
  if (isAxiosResponse(response)) {
    if ((response.data) &&
      (response.data
        .error)) {
      console.log(`${new Date()} [API ERROR] ${response.data.error}`);
      return Observable.empty();
    }
    if (exchangeRequest.command ===
      ExchangeCommand.Buy) {
      v = true;
    } else if (exchangeRequest.command ===
      ExchangeCommand.ReturnCommissionInfo) {
      v = {
        maker: .15,
        taker: .25
      }; //placeholder
    } else if (exchangeRequest.command ===
      ExchangeCommand.ReturnInventory) {
      v = [new Car(PriceRange.Low),
        new Car(PriceRange.Low),
        new Car(PriceRange.Low),
        new Car(PriceRange.Mid),
        new Car(PriceRange.High),
        new Car(PriceRange.High)
      ]; //placeholder
    } else {
      console.log(`${new Date()} [API ERROR] Command ${exchangeRequest.command} not handled`);
      return Observable.empty();
    }
  }
  console.log(`${new Date()} [RESPONSE]`);
  return Observable.of(new ExchangeRequestResponse(exchangeRequest, v));
}
export class TaskResponse {
  constructor(public readonly response: any, public readonly task: Task) {}
}
