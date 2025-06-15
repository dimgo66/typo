import "./globals.css";

export const metadata = {
  title: "Типографский процессор",
  description: "Обработка русского текста по правилам типографики",
  keywords:
    "типографика, обработка текста, русский текст, docx, word, поэзия, неразрывные пробелы, тире, онлайн, Дмитрий Горяченков",
  url: "https://typography.vercel.app/",
  image: "/og-image.png",
  author: "Дмитрий Горяченков",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
