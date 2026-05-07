import { Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-left-side-bar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './left-side-bar.html',
  styleUrl: './left-side-bar.css',
})
export class LeftSidebar {
  isLeftSidebarCollapsed = input.required<boolean>();
  changeIsLeftSidebarCollapsed = output<boolean>();
  items = [
    {
      routeLink: '/produto',
      icon: 'fas fa-box',
      label: 'Produto',
      
    },
    {
      routeLink: '/baixo-custom',
      icon: 'fas fa-tools',
      label: 'Baixo Custom',
    },
    {
      routeLink: 'settings',
      icon: 'fal fa-cog',
      label: 'Settings',
    },
  ];

  toggleCollapse(): void {
    this.changeIsLeftSidebarCollapsed.emit(!this.isLeftSidebarCollapsed());
  }

}