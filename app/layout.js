import { Poppins } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins", // optional (CSS variable হিসেবে ব্যবহার করতে চাইলে)
});

export const metadata = {
  title: {
    default: "Vantis Capital - Trade your future",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
