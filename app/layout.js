import { Poppins, Nunito } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-poppins',
})

const nunito = Nunito({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
    variable: '--font-nunito',
})

export const metadata = {
    title: 'AI Study Buddy ✨',
    description: 'Your cozy AI-powered study companion — learn, quiz, plan & stay motivated!',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${poppins.variable} ${nunito.variable} font-poppins`}>
                {children}
            </body>
        </html>
    )
}
