import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import useWallet from './hooks/useWallet';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'product'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { wallet, address, balance, demoMode, connectWallet, disconnectWallet } = useWallet();
  console.log("App.jsx - Wallet State:", { address, isConnected: !!address });

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setCurrentView('product');
    window.scrollTo(0, 0);
  };

  const handleBackToStore = () => {
    setSelectedProduct(null);
    setCurrentView('home');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary/30">
      <Navbar
        isConnected={!!address}
        address={address}
        balance={balance}
        isDemoMode={demoMode}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
      />

      <main className="pt-20 pb-12 relative">
        {/* Background Elements */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black -z-20"></div>
        <div className="fixed top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 -z-10 pointer-events-none"></div>

        {currentView === 'home' ? (
          <ProductList onProductSelect={handleProductSelect} />
        ) : (
          <ProductDetail
            product={selectedProduct}
            onBack={handleBackToStore}
            address={address}
            isConnected={!!address}
            connectWallet={connectWallet}
            wallet={wallet}
          />
        )}
      </main>

      <footer className="bg-slate-900 border-t border-white/5 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500">
            Built for Cardano Hackathon IBW Edition 2025 by BinaryVerse
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
