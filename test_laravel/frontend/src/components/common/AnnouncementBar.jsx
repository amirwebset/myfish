import React from 'react';
import { ShieldCheck, Truck, Sparkles, MessageSquare } from 'lucide-react';
import { getWhatsAppUrl } from '../../utils/whatsapp';

export default function AnnouncementBar() {
  return (
    <div className="bg-gradient-to-r from-ocean-950 via-ocean-900 to-slate-950 text-white text-[11px] font-medium py-2 px-4 border-b border-white/10 hidden sm:block">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-turquoise-300">
            <ShieldCheck className="w-3.5 h-3.5 text-turquoise-400" />
            <strong className="font-bold text-white">Garansi 100% Hidup:</strong> Klaim garansi penggantian jika ikan mati saat sampai.
          </span>
          <span className="hidden lg:flex items-center gap-1.5 text-slate-300">
            <Truck className="w-3.5 h-3.5 text-ocean-400" />
            Packing Tabung Oksigen & Box Styrofoam Standar Kargo Madura.
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href={getWhatsAppUrl('Halo Admin IKANKU Pasanggar, saya ingin konsultasi mengenai ikan hias.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 transition font-bold"
          >
            <MessageSquare className="w-3 h-3 text-emerald-400" />
            CS WhatsApp: 0812-3456-7890
          </a>
        </div>

      </div>
    </div>
  );
}
