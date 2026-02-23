import React from "react";
import Sidebar from "./components/layout/Sidebar";
import TabBar from "./components/layout/TabBar";
import ThemeProvider from "./components/layout/ThemeProvider";

export default function Layout({ children, currentPageName }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-zinc-50/80 dark:bg-zinc-950">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          @supports (padding: max(0px)) {
            .pb-safe {
              padding-bottom: max(env(safe-area-inset-bottom), 0.5rem);
            }
          }
          * { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
          }
          body { 
            -webkit-font-smoothing: antialiased; 
            -moz-osx-font-smoothing: grayscale;
          }
        `}</style>
        <Sidebar currentPage={currentPageName} />
        <main className="lg:pl-[252px] pl-0 min-h-screen" style={{
          paddingTop: 'max(env(safe-area-inset-top), 1rem)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 5rem)'
        }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-16 lg:pt-6 pb-20 lg:pb-6">
            {children}
          </div>
        </main>
        <TabBar currentPage={currentPageName} />
      </div>
    </ThemeProvider>
  );
}