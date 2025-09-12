import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { IScoreCategory } from '../../models/score-category.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-score-bar-chart',
  template: `
    <div class="chart-container">
      <canvas #barChart width="600" height="300"></canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      width: 100%;
      margin: 0 auto;
    }
    canvas {
      width: 100% !important;
      height: auto !important;
    }
  `]
})
export class ScoreBarChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() scores: IScoreCategory[] = [];
  @ViewChild('barChart', { static: true }) barChartRef!: ElementRef<HTMLCanvasElement>;
  
  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    if (this.scores.length > 0) {
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['scores'] && !changes['scores'].firstChange && this.barChartRef) {
      this.updateChart();
    }
  }

  private createChart(): void {
    if (!this.barChartRef) return;

    const ctx = this.barChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Filter out swimming scores and prepare data for 4 categories
    const filteredScores = this.scores.filter(score => 
      !score.categoryName.toLowerCase().includes('swimming')
    );

    const labels = filteredScores.map(score => this.getShortLabel(score.categoryName));
    const data = filteredScores.map(score => score.score);
    const backgroundColors = data.map(score => this.getScoreColor(score));

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Score',
          data: data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: (context) => {
                const index = context[0].dataIndex;
                return filteredScores[index].categoryName;
              },
              label: (context) => {
                const index = context.dataIndex;
                const rating = filteredScores[index].rating;
                return [
                  `Score: ${context.parsed.y}/100`,
                  `Rating: ${rating}`
                ];
              },
              afterBody: (context) => {
                const index = context[0].dataIndex;
                const perks = filteredScores[index].perks;
                if (perks.length > 0) {
                  return ['', 'Achievements:', ...perks.map(perk => `• ${perk}`)];
                }
                return [];
              }
            },
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(252, 76, 2, 1)',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            titleFont: { size: 16, weight: 'bold' },
            bodyFont: { size: 14 },
            padding: 12
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20,
              callback: (value) => `${value}`,
              color: '#d1d5db',
              font: {
                size: 12
              }
            },
            grid: {
              color: '#4b5563',
              lineWidth: 1
            },
            title: {
              display: true,
              text: 'Score',
              color: '#f9fafb',
              font: {
                size: 14,
                weight: 600
              }
            }
          },
          x: {
            ticks: {
              color: '#f9fafb',
              font: {
                size: 14,
                weight: 600
              }
            },
            grid: {
              display: false
            }
          }
        },
        animation: {
          duration: 1500,
          easing: 'easeInOutQuart',
          delay: (context) => {
            return context.dataIndex * 200; // Staggered animation
          }
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
    const backgroundColors = data.map(score => this.getScoreColor(score));

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data;
    this.chart.data.datasets[0].backgroundColor = backgroundColors;
    this.chart.data.datasets[0].borderColor = backgroundColors.map(color => color.replace('0.8', '1'));
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

  private getScoreColor(score: number): string {
    if (score >= 80) return 'rgba(34, 197, 94, 0.8)'; // Success green
    if (score >= 60) return 'rgba(252, 76, 2, 0.8)';  // Strava orange
    if (score >= 40) return 'rgba(234, 179, 8, 0.8)'; // Warning yellow
    return 'rgba(239, 68, 68, 0.8)'; // Error red
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}