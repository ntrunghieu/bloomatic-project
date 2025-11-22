import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CinemaHeroComponent } from './cinema-hero.component';

describe('CinemaHeroComponent', () => {
  let component: CinemaHeroComponent;
  let fixture: ComponentFixture<CinemaHeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CinemaHeroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CinemaHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
