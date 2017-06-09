// Car dealer exchange client
// * Subscribe to market conditions through an exchange and trade cars.

import 'core-js';

console.log('Carflip');

import {Carflip} from './lib/carflip';

const carflip = new Carflip();

carflip.trade$()
       .subscribe(x => console.log(x));
