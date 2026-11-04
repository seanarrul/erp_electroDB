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

  const displayName = user.fullName || 'Jeptah Ashley Ildefonso';

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-bg text-text font-sans transition-colors duration-150">
        {/* Left Rail: Collapsible Navigation Sidebar connected to user account */}
        <Sidebar userRole={user.role} userName={displayName} />

        {/* Center Main Channel */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-bg">
          <Header userRole={user.role} userName={displayName} />
          <main className="flex-1 overflow-y-auto flex flex-col justify-between scroll-smooth">
            <div className="max-w-[1240px] mx-auto w-full p-4 sm:p-6 md:p-8 flex-1">
              {children}
            </div>

            {/* Global Broadsheet Footer */}
            <footer className="w-full mt-auto bg-[#041a24] dark:bg-surface-1 text-white/80 dark:text-text-muted border-t border-[#041a24] dark:border-border select-none shrink-0 transition-colors duration-150">
              <div className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center space-x-2.5">
                  <span className="font-editorial italic text-base text-white dark:text-text font-normal">
                    ElectronDB
                  </span>
                  <span className="text-white/30 dark:text-border-control">&bull;</span>
                  <span className="text-[10px] uppercase tracking-wider text-white/70 dark:text-text-muted font-mono">
                    G4 HOPEERD &bull; MONITORING SYSTEM
                  </span>
                </div>
                <div className="text-[10px] text-white/50 dark:text-text-faint tracking-wider">
                  EST. 2026 &bull; ALL RIGHTS RESERVED
                </div>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
