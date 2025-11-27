import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import MUIThemeProvider from "./theme-provider";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import DarkModeToggle from "./components/DarkModeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Posts App",
  description: "Full-stack posts application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} antialiased`}
      >
        <MUIThemeProvider>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Posts App
              </Typography>
              <DarkModeToggle />
            </Toolbar>
          </AppBar>
          <Box component="main">
            {children}
          </Box>
        </MUIThemeProvider>
      </body>
    </html>
  );
}
