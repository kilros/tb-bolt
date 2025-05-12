import "./globals.css";
// import Footer from "@/components/layout/Footer";
import TBProvider from "./provider";

export const metadata = {
  title: "Tome Block - Enterprise CLM & DMS",
  description: "Decentralized Contract Lifecycle and Document Management System for the modern enterprise",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <TBProvider>
          {children}
        </TBProvider>
      </body>
    </html>
  );
}
