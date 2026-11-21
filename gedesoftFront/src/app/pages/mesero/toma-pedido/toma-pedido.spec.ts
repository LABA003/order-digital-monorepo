import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TomaPedido } from './toma-pedido';

describe('TomaPedido', () => {
  let component: TomaPedido;
  let fixture: ComponentFixture<TomaPedido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TomaPedido]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TomaPedido);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
