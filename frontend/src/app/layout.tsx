import "./globals.css";
import React from "react";

export const metadata = {
  title: "AI Security Investigation Platform (Build with Paritok)",
  description: "AI-powered Security Investigation Workspace demonstrating Paritok Context Optimization.",
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
