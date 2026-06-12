import { Component, HostListener, OnInit, signal } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { LeftSidebar } from "./components/left-side-bar/left-side-bar";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, LeftSidebar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('FrontAngularBaixoCustom');

  isLeftSidebarCollapsed = signal<boolean>(true);
  screenWidth = signal<number>(window.innerWidth);
  isAdmin = signal<boolean>(false);

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAdmin.set(event.urlAfterRedirects.includes('/admin'));
    });
  }

  ngOnInit() {
    this.isAdmin.set(this.router.url.includes('/admin'));
  }

  @HostListener('window:resize')
  onResize() {
    this.screenWidth.set(window.innerWidth);
    if (this.screenWidth() < 768) {
      this.isLeftSidebarCollapsed.set(true);
    }
  }



  changeIsLeftSidebarCollapsed(isLeftSidebarCollapsed: boolean): void {
    this.isLeftSidebarCollapsed.set(isLeftSidebarCollapsed);
  }

  toggleSidebar(): void {
    this.isLeftSidebarCollapsed.update(val => !val);
  }

}
