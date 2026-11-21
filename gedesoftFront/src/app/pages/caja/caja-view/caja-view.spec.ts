import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CajaView } from './caja-view';

describe('CajaView', () => {
  let component: CajaView;
  let fixture: ComponentFixture<CajaView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CajaView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CajaView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
