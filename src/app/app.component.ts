import { Component } from '@angular/core';
import { EMPTY, from, Observable } from 'rxjs';
import {
  catchError,
  map,
  share,
  startWith,
  switchMap,
  switchMapTo,
  take,
  tap,
} from 'rxjs/operators';
import abi from '../assets/abi.json';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  status: string = '';
  web3 = new Web3((window as any).web3.currentProvider);
  contract = new this.web3.eth.Contract(
    abi as AbiItem[],
    '0x56e59d14B4767A816d1060676994D44Ae8f5536E'
  );
  eth = (window as any).ethereum;
  account$: Observable<string> = from<string[]>(
    this.eth.request({ method: 'eth_requestAccounts' })
  ).pipe(
    map(([account]) => account),
    share(),
    catchError((e) => {
      console.warn('Wallet lookup fail', e);
      return EMPTY;
    })
  );

  release(): void {
    this.status = '';
    this.account$
      .pipe(
        tap(() => (this.status = 'Wait')),
        switchMap((addr) =>
          from(this.contract.methods.release(addr).send({ from: addr }))
        ),
        tap(() => (this.status = 'Done')),
        take(1),
        catchError((err) => {
          console.warn(err);
          this.status = 'Fail';
          return EMPTY;
        })
      )
      .subscribe(console.log);
  }
}
