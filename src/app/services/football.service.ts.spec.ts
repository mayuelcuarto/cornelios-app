import { TestBed } from '@angular/core/testing';

import { FootballServiceTs } from './football.service.ts';

describe('FootballServiceTs', () => {
  let service: FootballServiceTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FootballServiceTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
