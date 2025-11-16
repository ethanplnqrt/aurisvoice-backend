'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader } from 'lucide-react';
import { getCapacitorInfo, isStandalone, isWebView } from '@/lib/capacitor';
import { useIsOffline } from '@/lib/useIsOffline';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  loading?: boolean;
  error?: string;
}

export function TestChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: 'offline', label: 'Mode Offline / Online détecté', checked: false },
    { id: 'android-install', label: 'Installation Android (APK/AAB)', checked: false },
    { id: 'ios-install', label: 'Installation iOS (via écran d\'accueil)', checked: false },
    { id: 'dubbing-test', label: 'Test Dubbing (10 sec)', checked: false },
    { id: 'credit-deduct', label: 'Crédit auto-déduit après dubbing', checked: false },
    { id: 'credit-add', label: 'Crédit ajouté via Checkout Stripe', checked: false },
    { id: 'navigation-offline', label: 'Navigation offline fonctionnelle', checked: false },
    { id: 'safe-area-ios', label: 'Safe-area iOS correcte', checked: false },
    { id: 'launchscreen', label: 'LaunchScreen correct', checked: false },
    { id: 'icons', label: 'Icônes correctes', checked: false },
  ]);
  
  const isOffline = useIsOffline();
  const info = getCapacitorInfo();
  
  useEffect(() => {
    // Auto-check items based on detection
    setItems(prev => prev.map(item => {
      switch (item.id) {
        case 'offline':
          return { ...item, checked: true }; // Can be tested manually
        case 'android-install':
          return { ...item, checked: info.platform === 'android' && info.isNative };
        case 'ios-install':
          return { ...item, checked: info.platform === 'ios' && (info.isNative || isStandalone()) };
        case 'safe-area-ios':
          return { ...item, checked: info.platform === 'ios' && document.body.classList.contains('ios-safe-area') };
        case 'navigation-offline':
          return { ...item, checked: isOffline && 'serviceWorker' in navigator };
        default:
          return item;
      }
    }));
  }, [info, isOffline]);
  
  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };
  
  const resetAll = () => {
    setItems(prev => prev.map(item => ({ ...item, checked: false })));
  };
  
  const checkAll = () => {
    setItems(prev => prev.map(item => ({ ...item, checked: true })));
  };
  
  const checkedCount = items.filter(item => item.checked).length;
  const totalCount = items.length;
  
  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Checklist de Tests</h2>
        <div className="flex gap-2">
          <button
            onClick={resetAll}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-sm"
          >
            Réinitialiser
          </button>
          <button
            onClick={checkAll}
            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors text-sm"
          >
            Tout cocher
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Progression</span>
          <span className="text-sm font-semibold text-white">
            {checkedCount} / {totalCount}
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(checkedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="space-y-3">
        {items.map(item => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors border border-white/5"
          >
            <div className="flex-shrink-0">
              {item.loading ? (
                <Loader className="w-5 h-5 text-blue-400 animate-spin" />
              ) : item.checked ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-500" />
              )}
            </div>
            <span className={`flex-1 ${item.checked ? 'text-white' : 'text-gray-400'}`}>
              {item.label}
            </span>
            {item.error && (
              <span className="text-xs text-red-400">{item.error}</span>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <p className="text-sm text-blue-300">
          <strong>Note:</strong> Certains tests nécessitent une action manuelle (ex: installation, test de dubbing).
          Les tests automatiques sont basés sur la détection de l'environnement.
        </p>
      </div>
    </div>
  );
}

