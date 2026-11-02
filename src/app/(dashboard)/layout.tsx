import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/actions/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { SidebarProvider } from '@/components/layout/SidebarContext';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // If unauthenticated, redirect to login
  if (!user) {
    redirect('/login');
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-[#F4F4F0] text-[#041a24] selection:bg-[#041a24] selection:text-white font-sans">
        {/* Left Rail: Collapsible Navigation Sidebar */}
        <Sidebar userRole={user.role} userName={user.fullName || 'Admin'} />

        {/* Center Main Channel */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F4F4F0]">
          <Header userRole={user.role} userName={user.fullName || 'Admin'} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 scroll-smooth">
            <div className="max-w-[1240px] mx-auto w-full">
              {children}

              {/* Editorial Broadsheet Colophon Footer */}
              <footer className="mt-16 pt-6 pb-10 border-t border-black/10 text-xs font-mono text-black/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#041a24] font-medium">
                    <span>Group 4 ElectronDB</span>
                    <span>&mdash;</span>
                    <span className="text-[11px] text-[#41555f]">Information Management Hope ERD</span>
                  </div>
                  <p className="text-[10px] text-[#55554F]">
                    Canonical 10-Table Relational Schema &bull; Strict 3NF Database System
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-[#41555f]">
                  <span>Monochromatic Editorial System</span>
                  <span>&bull;</span>
                  <span>Typeset in Newsreader &amp; Geist</span>
                </div>
              </footer>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
