import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { fromEvent, interval, merge, NEVER, Observable, Subject } from 'rxjs';
import { map, mapTo, scan, startWith, switchMap, tap } from 'rxjs/operators';

interface State {
  count: boolean;
  countup: boolean;
  speed: number;
  value: number;
  increase: number;
}

const INITIAL_STATE: State = {
  count: false,
  speed: 1000,
  value: 0,
  countup: true,
  increase: 1
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  @ViewChild('start') start: MatButton;
  @ViewChild('stop') stop: MatButton;
  @ViewChild('reset') reset: MatButton;
  @ViewChild('countUp') countUp: MatButton;
  @ViewChild('countDown') countDown: MatButton;
  @ViewChild('setValue') setValue: MatButton;
  @ViewChild('setSpeed') setSpeed: MatButton;
  @ViewChild('setIncrease') setIncrease: MatButton;

  value: number = INITIAL_STATE.value;
  speed: number = INITIAL_STATE.speed;
  increase: number = INITIAL_STATE.increase;

  counter$ = new Subject<number>();

  ngAfterViewInit(): void {
    this.run();
  }

  run(): void {
    const events$ = merge(
      this.fromClickMapTo(this.start, { count: true }),
      this.fromClickMapTo(this.stop, { count: false }),
      this.fromClickMapTo(this.reset, { value: 0 }),
      this.fromClickMapTo(this.countUp, { countup: true }),
      this.fromClickMapTo(this.countDown, { countup: false }),
      this.fromClickMap(this.setValue, () => ({ value: +this.value })),
      this.fromClickMap(this.setSpeed, () => ({ speed: +this.speed })),
      this.fromClickMap(this.setIncrease, () => ({ increase: +this.increase })),
    );

    const counter$ = events$.pipe(
      startWith(INITIAL_STATE),
      scan((state: State, curr): State => ({ ...state, ...curr }), {}),
      tap((state: State) => this.counter$.next(state.value)),
      switchMap((state: State) =>
        state.count
          ? interval(state.speed).pipe(
            tap(
              _ =>
                (state.value += state.countup ? state.increase : -state.increase)
            ),
            tap(_ => this.counter$.next(state.value))
          )
          : NEVER
      )
    );

    counter$.subscribe();
  }

  private fromClickMapTo(element: MatButton, value: Partial<State>): Observable<Partial<State>> {
    return fromEvent(element._elementRef.nativeElement, 'click').pipe(mapTo(value));
  }

  private fromClickMap(element: MatButton, mapFun: () => Partial<State>): Observable<Partial<State>> {
    return fromEvent(element._elementRef.nativeElement, 'click').pipe(map(mapFun));
  }


}
