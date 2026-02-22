'use client'
import { useEffect, useRef } from 'react'

export default function VisualAids({ mermaidCode, comparisonTable }) {
    const mermaidRef = useRef(null)

    useEffect(() => {
        if (!mermaidCode || !mermaidRef.current) return

        let cancelled = false

        // Basic sanitization
        const cleanCode = mermaidCode
            .replace(/\\n/g, '\n') // Handle escaped newlines
            .replace(/&/g, '&amp;') // Simple escape for &
            .trim()

        import('mermaid').then(({ default: mermaid }) => {
            if (cancelled) return

            mermaid.initialize({
                startOnLoad: false,
                theme: 'base',
                securityLevel: 'loose', // Needed specifically for customized rendering in some environments
                logLevel: 'error',
                themeVariables: {
                    primaryColor: '#fce7f3',
                    primaryTextColor: '#be185d',
                    primaryBorderColor: '#f9a8d4',
                    lineColor: '#ec4899',
                    secondaryColor: '#fdf4ff',
                    tertiaryColor: '#fff',
                },
            })

            const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`

            try {
                mermaid.render(id, cleanCode).then(({ svg }) => {
                    if (mermaidRef.current && !cancelled) {
                        mermaidRef.current.innerHTML = svg
                    }
                }).catch(err => {
                    console.warn('Mermaid render error:', err)
                    if (mermaidRef.current && !cancelled) {
                        mermaidRef.current.innerHTML = '<p class="text-pink-400 text-sm italic">Sketchy diagram? Our AI is drawing a blank here! 🌸</p>'
                    }
                })
            } catch (syncErr) {
                console.warn('Mermaid sync error:', syncErr)
                if (mermaidRef.current && !cancelled) {
                    mermaidRef.current.innerHTML = '<p class="text-pink-400 text-sm italic">Sketchy diagram? Our AI is drawing a blank here! 🌸</p>'
                }
            }
        })

        return () => { cancelled = true }
    }, [mermaidCode])

    if (!mermaidCode && (!comparisonTable || !comparisonTable.headers)) return null

    return (
        <div className="space-y-5 mt-4">
            {mermaidCode && (
                <div>
                    <h4 className="text-sm font-bold text-pink-600 mb-2 flex items-center gap-2">
                        🗺️ Concept Diagram
                    </h4>
                    <div className="glass-card p-4 mermaid-wrap overflow-x-auto" ref={mermaidRef}>
                        <p className="text-xs text-gray-400 animate-pulse">Loading diagram…</p>
                    </div>
                </div>
            )}

            {comparisonTable?.headers && comparisonTable.rows?.length > 0 && (
                <div>
                    <h4 className="text-sm font-bold text-pink-600 mb-2 flex items-center gap-2">
                        📊 Comparison Table
                    </h4>
                    <div className="overflow-x-auto rounded-2xl shadow-sm">
                        <table className="comp-table">
                            <thead>
                                <tr>
                                    {comparisonTable.headers.map((h, i) => (
                                        <th key={i}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonTable.rows.map((row, ri) => (
                                    <tr key={ri}>
                                        {row.map((cell, ci) => (
                                            <td key={ci}>{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
