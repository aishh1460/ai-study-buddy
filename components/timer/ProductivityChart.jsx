'use client'
import { useEffect, useRef } from 'react'

export default function ProductivityChart({ studyData }) {
    const canvasRef = useRef(null)
    const chartRef = useRef(null)

    useEffect(() => {
        if (!canvasRef.current) return

        let destroyed = false

        import('chart.js/auto').then(({ default: Chart }) => {
            if (destroyed || !canvasRef.current) return
            if (chartRef.current) chartRef.current.destroy()

            const days = [...Array(7)].map((_, i) => {
                const d = new Date()
                d.setDate(d.getDate() - (6 - i))
                return d.toLocaleDateString('en', { weekday: 'short' })
            })

            chartRef.current = new Chart(canvasRef.current, {
                type: 'bar',
                data: {
                    labels: days,
                    datasets: [{
                        label: 'Study Minutes',
                        data: studyData || [0, 20, 45, 30, 60, 25, 50],
                        backgroundColor: 'rgba(236,72,153,0.25)',
                        borderColor: '#ec4899',
                        borderWidth: 2,
                        borderRadius: 10,
                        borderSkipped: false,
                    }],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: ctx => `${ctx.formattedValue} mins`,
                            },
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { color: '#be185d', font: { family: 'Poppins', size: 11 } },
                            grid: { color: 'rgba(236,72,153,0.1)' },
                        },
                        x: {
                            ticks: { color: '#be185d', font: { family: 'Poppins', size: 11 } },
                            grid: { display: false },
                        },
                    },
                },
            })
        })

        return () => {
            destroyed = true
            if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null }
        }
    }, [studyData])

    return (
        <div className="glass-card p-5 mb-6">
            <h3 className="section-header text-xl font-bold mb-4">📊 Weekly Study Chart</h3>
            <canvas ref={canvasRef} height={160} />
            <p className="text-xs text-center text-gray-400 mt-2">
                Study minutes logged through Pomodoro sessions
            </p>
        </div>
    )
}
