import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { EnquiryDrawer } from '../enquiry/EnquiryDrawer';

export const CustomerLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#292522]">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <EnquiryDrawer />
    </div>
  );
};
