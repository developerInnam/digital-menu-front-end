import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QrCode, X, Check, Users, Sparkles, MapPin } from 'lucide-react';

export const TableSelectionModal: React.FC = () => {
  const { activeVendor, tables, activeTableNumber, setActiveTableNumber, isTableModalOpen, setIsTableModalOpen } = useApp();

  if (!activeVendor || !isTableModalOpen) return null;

  const [customTable, setCustomTable] = useState('');
  const [selectedTable, setSelectedTable] = useState(activeTableNumber);

  const handleSelectAndConfirm = (tableStr: string) => {
    setActiveTableNumber(tableStr);
    setIsTableModalOpen(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTable.trim()) return;
    const formatted = customTable.toLowerCase().startsWith('table')
      ? customTable.trim()
      : `Table ${customTable.trim()}`;
    handleSelectAndConfirm(formatted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-slate-900 text-base">
                Select Your Table
              </h3>
              <p className="text-xs text-slate-500">
                {activeVendor.name} • Ordering in-house
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsTableModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Table Pill */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-amber-900 font-medium">Currently Selected:</span>
          </div>
          <span className="text-xs font-bold text-amber-950 px-2.5 py-0.5 bg-white rounded-lg border border-amber-300 shadow-2xs">
            {activeTableNumber}
          </span>
        </div>

        {/* Table Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Available Tables ({tables.length})
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
            {tables.map(tbl => {
              const tableLabel = `Table ${tbl.tableNumber}`;
              const isCurrent = activeTableNumber === tableLabel;
              const isSelected = selectedTable === tableLabel;

              return (
                <button
                  key={tbl.id}
                  type="button"
                  onClick={() => {
                    setSelectedTable(tableLabel);
                    handleSelectAndConfirm(tableLabel);
                  }}
                  className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${isSelected || isCurrent
                      ? 'bg-orange-600 border-orange-600 text-white shadow-md shadow-orange-600/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-orange-400 hover:bg-orange-50/40'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold">#{tbl.tableNumber}</span>
                    {isCurrent && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`text-[10px] mt-2 flex items-center gap-1 ${isSelected || isCurrent ? 'text-orange-100' : 'text-slate-400'
                    }`}>
                    <Users className="w-3 h-3" />
                    <span>{tbl.capacity} seats</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Table / Seating Area Input */}
        <div className="border-t border-slate-100 pt-3">
          <form onSubmit={handleCustomSubmit} className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Or Enter Specific Table / Area Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="E.g. Table 12, Bar Seat 3, Rooftop 5"
                value={customTable}
                onChange={e => setCustomTable(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Set Table
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>Kitchen tickets will print to this table</span>
          <button
            type="button"
            onClick={() => setIsTableModalOpen(false)}
            className="text-slate-600 hover:text-slate-900 font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
