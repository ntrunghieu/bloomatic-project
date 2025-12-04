import { TestBed } from '@angular/core/testing';

import { SeatConfigService } from './seat-config.service';

describe('SeatConfigService', () => {
  let service: SeatConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeatConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
