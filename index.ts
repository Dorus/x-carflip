// Car dealer exchange client

import 'core-js';

console.log('Carflip');

import {Carflip} from './lib/carflip';

const carflip = new Carflip();

carflip.trade$()
       .subscribe(carRequestResponse => console.log(carRequestResponse));
