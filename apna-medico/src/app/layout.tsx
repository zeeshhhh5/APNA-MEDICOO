import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LanguageProvider } from "@/contexts/language-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Apna Medico — Your AI Health Partner",
  description:
    "India's first AI-powered healthcare platform. Book ambulances, consult AI doctors, find hospitals, and get medicines delivered — all in one place.",
  keywords: "healthcare, AI doctor, ambulance booking, hospital locator, medicine delivery, India",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      appearance={{
        variables: { colorPrimary: "#0ea5e9" },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} antialiased font-sans`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <LanguageProvider>
              {children}
            </LanguageProvider>
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
