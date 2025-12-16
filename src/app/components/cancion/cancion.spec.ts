import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cancion } from './cancion';

describe('Cancion', () => {
  let component: Cancion;
  let fixture: ComponentFixture<Cancion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cancion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cancion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
