import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountTicketHistoryComponent } from './account-ticket-history.component';

describe('AccountTicketHistoryComponent', () => {
  let component: AccountTicketHistoryComponent;
  let fixture: ComponentFixture<AccountTicketHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountTicketHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountTicketHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
