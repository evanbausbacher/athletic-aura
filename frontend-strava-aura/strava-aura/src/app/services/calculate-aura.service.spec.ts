import { TestBed } from '@angular/core/testing';

import { CalculateAuraService } from './calculate-aura.service';

describe('CalculateAuraService', () => {
  let service: CalculateAuraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalculateAuraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
