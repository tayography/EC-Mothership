import React from "react";
import Sidebar from "./components/layout/Sidebar";

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-zinc-50/80">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
      `}</style>
      <Sidebar currentPage={currentPageName} />
      <main className="lg:pl-[252px] pl-0 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-16 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}