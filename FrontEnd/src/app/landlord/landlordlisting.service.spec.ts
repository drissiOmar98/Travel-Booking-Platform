import { TestBed } from '@angular/core/testing';

import { LandlordlistingService } from './landlordlisting.service';

describe('LandlordlistingService', () => {
  let service: LandlordlistingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LandlordlistingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
