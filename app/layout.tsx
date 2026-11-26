import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Taskly — Local services, done well",
    template: "%s | Taskly",
  },
  description:
    "A local services marketplace. Post tasks, hire skilled taskers, and get it done.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f7f8f5] text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
