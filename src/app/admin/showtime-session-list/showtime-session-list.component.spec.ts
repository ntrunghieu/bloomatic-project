import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowtimeSessionListComponent } from './showtime-session-list.component';

describe('ShowtimeSessionListComponent', () => {
  let component: ShowtimeSessionListComponent;
  let fixture: ComponentFixture<ShowtimeSessionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowtimeSessionListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowtimeSessionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
