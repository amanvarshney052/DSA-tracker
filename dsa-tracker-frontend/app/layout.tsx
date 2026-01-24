import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'DSA Progress Tracker',
    description: 'Track your DSA journey and ace your coding interviews',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
