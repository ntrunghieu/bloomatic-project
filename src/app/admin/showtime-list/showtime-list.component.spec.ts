import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowtimeListComponent } from './showtime-list.component';

describe('ShowtimeListComponent', () => {
  let component: ShowtimeListComponent;
  let fixture: ComponentFixture<ShowtimeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowtimeListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowtimeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
