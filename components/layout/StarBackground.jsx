'use client'
import { useEffect, useRef } from 'react'

export default function StarBackground() {
    const containerRef = useRef(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const colors = ['rgba(236,72,153,0.5)', 'rgba(192,132,252,0.5)', 'rgba(249,168,212,0.6)', 'rgba(255,255,255,0.7)']
        const starCount = 55

        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div')
            star.className = 'star'
            const size = Math.random() * 5 + 2
            const x = Math.random() * 100
            const delay = Math.random() * 8
            const duration = Math.random() * 6 + 6
            const color = colors[Math.floor(Math.random() * colors.length)]

            Object.assign(star.style, {
                width: `${size}px`,
                height: `${size}px`,
                left: `${x}%`,
                bottom: `${Math.random() * 100}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                background: color,
                boxShadow: `0 0 ${size * 2}px ${color}`,
            })

            container.appendChild(star)
        }

        return () => { if (container) container.innerHTML = '' }
    }, [])

    return <div className="stars-container" ref={containerRef} aria-hidden="true" />
}
