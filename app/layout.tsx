import './globals.css';

export const metadata = {
  title: 'PizzaDAO Arcade',
  description: 'Retro arcade menu'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
