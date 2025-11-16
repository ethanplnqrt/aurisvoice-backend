'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { TestChecklist } from '@/components/TestChecklist';
import { getCapacitorInfo, isCapacitor, getPlatform, isWebView, isStandalone, isPWA } from '@/lib/capacitor';
import { useIsOffline } from '@/lib/useIsOffline';
import { 
  Smartphone, 
  Monitor, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  XCircle,
  Activity,
  Info,
  Loader2
} from 'lucide-react';

interface DeviceInfo {
  platform: string;
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  language: string;
  timezone: string;
}

interface SWStatus {
  registered: boolean;
  active: boolean;
  installing: boolean;
  waiting: boolean;
  error: string | null;
}

export default function MobileTestsPage() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [swStatus, setSwStatus] = useState<SWStatus>({
    registered: false,
    active: false,
    installing: false,
    waiting: false,
    error: null,
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [installMode, setInstallMode] = useState<string>('unknown');
  const isOffline = useIsOffline();
  const info = getCapacitorInfo();
  
  useEffect(() => {
    // Get device info
    setDeviceInfo({
      platform: getPlatform(),
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      devicePixelRatio: window.devicePixelRatio,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    
    // Detect install mode
    let mode = 'Web Browser';
    if (isCapacitor()) {
      mode = `Capacitor (${getPlatform()})`;
    } else if (isPWA()) {
      mode = 'PWA (Installed)';
    } else if (isStandalone()) {
      mode = 'Standalone';
    } else if (isWebView()) {
      mode = 'WebView';
    }
    setInstallMode(mode);
    
    // Check service worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          setSwStatus(prev => ({
            ...prev,
            registered: true,
            active: !!registration.active,
            installing: !!registration.installing,
            waiting: !!registration.waiting,
          }));
          
          addLog('Service Worker registered');
          
          if (registration.active) {
            addLog('Service Worker active');
          }
          if (registration.installing) {
            addLog('Service Worker installing...');
          }
          if (registration.waiting) {
            addLog('Service Worker waiting...');
          }
        } else {
          setSwStatus(prev => ({
            ...prev,
            registered: false,
            error: 'No service worker registration found',
          }));
          addLog('No service worker registration found');
        }
      }).catch(error => {
        setSwStatus(prev => ({
          ...prev,
          error: error.message,
        }));
        addLog(`Service Worker error: ${error.message}`);
      });
    } else {
      setSwStatus(prev => ({
        ...prev,
        error: 'Service Workers not supported',
      }));
      addLog('Service Workers not supported in this browser');
    }
    
    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        addLog('Service Worker controller changed');
        setSwStatus(prev => ({ ...prev, active: true }));
      });
      
      navigator.serviceWorker.addEventListener('message', (event) => {
        addLog(`Service Worker message: ${JSON.stringify(event.data)}`);
      });
    }
  }, []);
  
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-49), `[${timestamp}] ${message}`]);
  };
  
  const clearLogs = () => {
    setLogs([]);
  };
  
  return (
    <>
      <Head>
        <title>Tests Mobile - AurisVoice</title>
        <meta name="description" content="Tests et diagnostics pour l'application mobile AurisVoice" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Tests Mobile</h1>
            <p className="text-gray-400">Diagnostics et vérifications pour Android/iOS</p>
          </div>
          
          {/* Device Info Card */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Informations de l'appareil</h2>
            </div>
            
            {deviceInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400 text-sm">Plateforme</span>
                  <p className="text-white font-semibold">{deviceInfo.platform}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Mode d'installation</span>
                  <p className="text-white font-semibold">{installMode}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Résolution</span>
                  <p className="text-white font-semibold">
                    {deviceInfo.screenWidth} × {deviceInfo.screenHeight}
                    {deviceInfo.devicePixelRatio !== 1 && ` (@${deviceInfo.devicePixelRatio}x)`}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Langue</span>
                  <p className="text-white font-semibold">{deviceInfo.language}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-gray-400 text-sm">User Agent</span>
                  <p className="text-white text-xs break-all">{deviceInfo.userAgent}</p>
                </div>
              </div>
            )}
            
            {/* Capacitor Info */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-white">Détection Capacitor</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  {info.isNative ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-500" />
                  )}
                  <span className={info.isNative ? 'text-green-400' : 'text-gray-500'}>
                    Native
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {info.isWebView ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-500" />
                  )}
                  <span className={info.isWebView ? 'text-green-400' : 'text-gray-500'}>
                    WebView
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {info.isStandalone ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-500" />
                  )}
                  <span className={info.isStandalone ? 'text-green-400' : 'text-gray-500'}>
                    Standalone
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {info.isPWA ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-500" />
                  )}
                  <span className={info.isPWA ? 'text-green-400' : 'text-gray-500'}>
                    PWA
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Service Worker Status */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Service Worker</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Statut</span>
                <div className="flex items-center gap-2">
                  {swStatus.active ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-semibold">Actif</span>
                    </>
                  ) : swStatus.registered ? (
                    <>
                      <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                      <span className="text-yellow-400 font-semibold">En attente</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 font-semibold">Inactif</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Enregistré</span>
                <span className={swStatus.registered ? 'text-green-400' : 'text-red-400'}>
                  {swStatus.registered ? 'Oui' : 'Non'}
                </span>
              </div>
              
              {swStatus.error && (
                <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <p className="text-red-400 text-sm">{swStatus.error}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Network Status */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              {isOffline ? (
                <WifiOff className="w-5 h-5 text-red-400" />
              ) : (
                <Wifi className="w-5 h-5 text-green-400" />
              )}
              <h2 className="text-xl font-bold text-white">Réseau</h2>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Connexion</span>
              <div className="flex items-center gap-2">
                {isOffline ? (
                  <>
                    <WifiOff className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 font-semibold">Hors ligne</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-semibold">En ligne</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Test Checklist */}
          <TestChecklist />
          
          {/* Logs */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Logs temps réel</h2>
              </div>
              <button
                onClick={clearLogs}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-sm"
              >
                Effacer
              </button>
            </div>
            
            <div className="bg-black/30 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <p className="text-gray-500">Aucun log pour le moment...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-gray-300 mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

