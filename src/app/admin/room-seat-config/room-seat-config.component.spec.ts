import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomSeatConfigComponent } from './room-seat-config.component';

describe('RoomSeatConfigComponent', () => {
  let component: RoomSeatConfigComponent;
  let fixture: ComponentFixture<RoomSeatConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomSeatConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomSeatConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
