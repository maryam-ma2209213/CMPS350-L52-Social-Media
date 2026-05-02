import "../css/styles.css";
import "./globals.css";

export const metadata = {
  title: "Camdee",
  description: "Connect with Friends",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://kit.fontawesome.com/05b76dde2a.css"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
