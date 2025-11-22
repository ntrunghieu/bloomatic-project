import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

type AdminView = 'dashboard' | 'movieList' | 'movieCreate';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, RouterLinkActive, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  activeView: AdminView = 'dashboard';

  todayRevenue = 760000;
  newCustomers = 0;
  soldTickets = 9;
  totalRevenue = 1826000;

  movies = [
    {
      id: 1,
      name: 'Furiosa: Câu Chuyện Từ Max Điên',
      releaseYear: 2024,
      genres: ['Khoa học - viễn tưởng', 'Hành động'],
      showDate: '17-05-2024',
      status: 'Công khai',
      createdDate: '13-04-2024'
    },
    {
      id: 2,
      name: 'Lật Mặt 7: Một Điều Ước',
      releaseYear: 2024,
      genres: ['Tâm lý', 'Tình cảm'],
      showDate: '26-04-2024',
      status: 'Công khai',
      createdDate: '13-04-2024'
    }
  ];

  movieBarData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Điềm mặt L', 'Chị Chị Em Em', '15 phim khác', 'Top 10 phim'],
    datasets: [
      {
        data: [25, 15, 10, 20],
        backgroundColor: '#60a5fa',
        borderRadius: 4,
        maxBarThickness: 40
      }
    ]
  };

  movieBarOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#e5e7eb' } }
    },
    plugins: {
      legend: { display: false }
    }
  };

  monthLineData: ChartConfiguration<'line'>['data'] = {
    labels: ['1/2024', '2/2024', '3/2024', '4/2024', '5/2024'],
    datasets: [
      {
        data: [10000000, 20000000, 15000000, 90000000, 30000000],
        borderColor: '#fb7185',
        backgroundColor: 'rgba(248, 113, 113, 0.15)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#fb7185'
      }
    ]
  };

  monthLineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#e5e7eb' } }
    },
    plugins: {
      legend: { display: false }
    }
  };
}
