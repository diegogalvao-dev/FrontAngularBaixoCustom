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
      routeLink: '/admin/produto',
      icon: 'fas fa-box',
      label: 'Produtos',
    },
    {
      routeLink: '/admin/baixo-custom',
      icon: 'fas fa-tools',
      label: 'Baixo Custom',
    },
    {
      routeLink: '/admin/captadores',
      icon: 'fas fa-wave-square',
      label: 'Captadores',
    },
    {
      routeLink: '/catalogo',
      icon: 'fas fa-shopping-cart',
      label: 'Ver Loja',
    },
  ];

  toggleCollapse(): void {
    this.changeIsLeftSidebarCollapsed.emit(!this.isLeftSidebarCollapsed());
  }

}