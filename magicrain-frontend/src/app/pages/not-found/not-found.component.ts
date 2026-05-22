import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="not-found-container">
      <div class="not-found-card">
        <<img src="assets/magikarp.png" alt="Magikarp" class="magikarp-img" />
        <h1>404</h1>
        <h2>¡Magikarp usó Splash!</h2>
        <p>Pero no pasó nada...</p>
        <p class="sub">La página que buscas no existe o fue eliminada.</p>
        <a routerLink="/dashboard" class="btn-primary btn-home">
          Volver al Dashboard
        </a>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      min-height: 100vh;
      background-color: #19192e;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .not-found-card {
      text-align: center;
      padding: 60px 40px;
    }
    .magikarp-img {
      width: 160px;
      height: auto;
      animation: splash 1s ease-in-out infinite alternate;
      display: block;
      margin: 0 auto 16px;
    }
    @keyframes splash {
      from { transform: rotate(-15deg) translateY(0); }
      to   { transform: rotate(15deg) translateY(-10px); }
    }
    h1 {
      font-size: 5rem;
      font-weight: 900;
      color: #dd1100;
      margin-bottom: 8px;
    }
    h2 { color: #fdc302; margin-bottom: 8px; }
    p { color: rgba(255,255,255,0.6); margin-bottom: 4px; }
    .sub { font-size: 0.9rem; margin-bottom: 32px; }
    .btn-home {
      display: inline-block;
      background-color: #dd1100;
      color: #fefefe;
      padding: 14px 32px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 1rem;
      transition: all 0.2s;
    }
    .btn-home:hover {
      background-color: #bb0e00;
      transform: translateY(-2px);
    }
  `]
})
export class NotFoundComponent {}
