import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoreService } from '../../../services/store.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  loading = false;

  constructor(private storeService: StoreService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.storeService.loading$.subscribe(loading => {
      this.loading = loading;
      this.cdr.detectChanges();
    });

    this.storeService.loadAllData().subscribe();
  }

  syncData() {
    this.storeService.syncData().subscribe();
  }
}