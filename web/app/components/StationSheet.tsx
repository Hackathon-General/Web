"use client";

import React from 'react';
import { valueTheme } from '../context/Theme';

interface StationSheetProps {
  station: any;
  onClose: () => void;
  isWithinRadius: boolean;
  onStartMission: (stationId: string) => void;
}

export default function StationSheet({ station, onClose, isWithinRadius, onStartMission }: StationSheetProps) {
  if (!station) return null;
  const config = valueTheme[station.value] || { label: 'ערך השביל', color: '#646464' };

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-2xl shadow-2xl p-5 z-50 max-h-[80%] overflow-y-auto border-t border-[#F0F0F0]">
      <div className="w-12 h-1 bg-[#F0F0F0] rounded-full mx-auto mb-4" />
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-bold px-3 py-1 rounded-full text-white" style={{ backgroundColor: config.color }}>
          {config.label}
        </span>
        <button onClick={onClose} className="text-lg text-[#646464] font-bold">✕</button>
      </div>
      <h2 className="text-lg font-extrabold text-[#212121] mb-1">{station.number}. {station.name}</h2>
      <p className="text-xs text-[#646464] mb-4 leading-relaxed">{station.aboutPlace}</p>
      <div className="space-y-3 text-xs mb-5">
        <div className="p-3 bg-[#FEF6ED] rounded-xl border border-[#F0F0F0]">
          <h4 className="font-bold text-[#D68C45] mb-1">מה עושים בתכלס:</h4>
          <p className="text-[#212121] leading-relaxed">{station.whatYouDo}</p>
        </div>
      </div>
      <button onClick={() => onStartMission(station.id)} className="w-full bg-[#2C6E49] text-white font-bold py-3 rounded-xl text-xs shadow-md">
        🌟 התחל משימה קהילתית במקום
      </button>
    </div>
  );
}