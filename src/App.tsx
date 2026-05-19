import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from '@/components/Navbar';
import HomePage from '@/pages/HomePage';
import CatalogPage from '@/pages/CatalogPage';
import ManufacturerPage from '@/pages/ManufacturerPage';
import ManufacturerCabinet from '@/pages/ManufacturerCabinet';
import AdminPage from '@/pages/AdminPage';

type Page = 'home' | 'catalog' | 'category' | 'region' | 'manufacturer' | 'manufacturer-cabinet' | 'admin';

interface NavState {
  page: Page;
  params: Record<string, string>;
}

function AppContent() {
  const [nav, setNav] = useState<NavState>({ page: 'home', params: {} });

  const handleNavigate = (page: string, params: Record<string, string> = {}) => {
    setNav({ page: page as Page, params });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (nav.page) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'catalog':
        return <CatalogPage onNavigate={handleNavigate} />;
      case 'category':
        return <CatalogPage filterCategory={nav.params.type} onNavigate={handleNavigate} />;
      case 'region':
        return <CatalogPage filterRegion={nav.params.name} onNavigate={handleNavigate} />;
      case 'manufacturer':
        return <ManufacturerPage manufacturerId={nav.params.id} onNavigate={handleNavigate} />;
      case 'manufacturer-cabinet':
        return <ManufacturerCabinet onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar currentPage={nav.page} onNavigate={handleNavigate} />
      <main>{renderPage()}</main>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <TooltipProvider>
      <AppContent />
    </TooltipProvider>
  );
}
