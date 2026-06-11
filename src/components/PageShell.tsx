import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { FolkDivider } from "./FolkDivider";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-cream min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 pt-20">
        <FolkDivider />
        {children}
      </main>
      <Footer />
    </div>
  );
}
