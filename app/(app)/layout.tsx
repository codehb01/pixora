import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {" "}
      <Sidebar />
      {children}
    </div>
  );
}
