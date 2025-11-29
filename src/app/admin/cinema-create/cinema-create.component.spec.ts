import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CinemaCreateComponent } from './cinema-create.component';

describe('CinemaCreateComponent', () => {
  let component: CinemaCreateComponent;
  let fixture: ComponentFixture<CinemaCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CinemaCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CinemaCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
