import "./globals.css";

export const metadata = {
  title: "RampWatch PH — Public Accessibility Registry",
  description: "Crowdsourced ramp accessibility ratings across the Philippines.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
