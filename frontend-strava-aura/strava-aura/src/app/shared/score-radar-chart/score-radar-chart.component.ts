import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { IScoreCategory } from '../../models/score-category.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-score-radar-chart',
  template: `
    <div class="chart-container">
      <canvas #radarChart width="400" height="400"></canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      width: 100%;
      max-width: 400px;
      margin: 0 auto;
    }
    canvas {
      width: 100% !important;
      height: auto !important;
    }
  `]
})
export class ScoreRadarChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() scores: IScoreCategory[] = [];
  @ViewChild('radarChart', { static: true }) radarChartRef!: ElementRef<HTMLCanvasElement>;
  
  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    if (this.scores.length > 0) {
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['scores'] && !changes['scores'].firstChange && this.radarChartRef) {
      this.updateChart();
    }
  }

  private createChart(): void {
    if (!this.radarChartRef) return;

    const ctx = this.radarChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Filter out swimming scores and prepare data for 4 categories
    const filteredScores = this.scores.filter(score => 
      !score.categoryName.toLowerCase().includes('swimming')
    );

    const labels = filteredScores.map(score => this.getShortLabel(score.categoryName));
    const data = filteredScores.map(score => score.score);
    const maxScore = 100;

    const config: ChartConfiguration<'radar'> = {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Aura Score',
          data: data,
          backgroundColor: 'rgba(252, 76, 2, 0.2)', // Strava orange with transparency
          borderColor: 'rgba(252, 76, 2, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(252, 76, 2, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(252, 76, 2, 1)',
          pointHoverBorderWidth: 3,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false // Hide legend to save space
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const categoryName = filteredScores[context.dataIndex].categoryName;
                const rating = filteredScores[context.dataIndex].rating;
                return [
                  `${categoryName}: ${context.parsed.r}/100`,
                  `Rating: ${rating}`
                ];
              }
            },
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(252, 76, 2, 1)',
            borderWidth: 1,
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: maxScore,
            ticks: {
              stepSize: 20,
              color: '#d1d5db',
              font: {
                size: 12
              },
              backdropColor: 'transparent'
            },
            grid: {
              color: '#4b5563',
              lineWidth: 1
            },
            angleLines: {
              color: '#4b5563',
              lineWidth: 1
            },
            pointLabels: {
              color: '#f9fafb',
              font: {
                size: 14,
                weight: 600
              },
              padding: 20
            }
          }
        },
        animation: {
          duration: 1500,
          easing: 'easeInOutQuart'
        }
      }
    };

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, config);
  }

  private updateChart(): void {
    if (!this.chart) {
      this.createChart();
      return;
    }

    const filteredScores = this.scores.filter(score => 
      !score.categoryName.toLowerCase().includes('swimming')
    );

    const labels = filteredScores.map(score => this.getShortLabel(score.categoryName));
    const data = filteredScores.map(score => score.score);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data;
    this.chart.update('active');
  }

  private getShortLabel(categoryName: string): string {
    const labelMap: Record<string, string> = {
      'Profile Completeness': 'Profile',
      'Cycling Score': 'Cycling',
      'Running Score': 'Running',
      'Epic Score': 'Epic'
    };
    return labelMap[categoryName] || categoryName;
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}