import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CocinaView } from './cocina-view';

describe('CocinaView', () => {
  let component: CocinaView;
  let fixture: ComponentFixture<CocinaView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CocinaView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CocinaView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
