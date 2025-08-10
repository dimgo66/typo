import "./globals.css";

export const metadata = {
  title: "Типографский процессор",
  description: "Обработка русского текста по правилам типографики",
  keywords:
    "онлайн типографика, типограф онлайн, типограф для docx, типограф Word онлайн, автоматическая типографика, docx formatter, Russian typography tool, обработать docx онлайн, конвертер docx типограф, Word docx processor, веб-типограф .docx, заменить кавычки ёлочки, длинное тире, неразрывные пробелы онлайн, расстановка диапазонов docx, исправить ошибки XML, сохранить сноски Word, типографика ГОСТ, типограф для издательства, типограф для диплома, типограф для научной статьи, русский Word proofreader, advanced typography processor, russian docx typography online, smart quotes docx, non-breaking space fixer, Дмитрий Горяченков",
  url: "https://typography.vercel.app/",
  image: "/og-image.webp",
  author: "Дмитрий Горяченков",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
  openGraph: {
    type: "website",
    url: "https://typography.vercel.app/",
    title: "Типографский процессор",
    description: "Обработка русского текста по правилам типографики",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Типографский процессор",
      },
    ],
  },
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
