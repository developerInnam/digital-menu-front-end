import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Printer,
  Plus,
  Trash2,
  ExternalLink,
  Wifi,
  Sparkles,
  Share2
} from 'lucide-react';

export const TableQrTab: React.FC = () => {
  const { tables, activeVendor, addTable, deleteTable } = useApp();

  const [selectedTableNumber, setSelectedTableNumber] = useState<string>(
    tables[0]?.tableNumber || '1'
  );
  const [newTableNum, setNewTableNum] = useState('');
  const [newCapacity, setNewCapacity] = useState(4);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate target URL for this table
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dinesmart.restaurant';
  const tableUrl = `${origin}?vendor=${activeVendor.slug}&table=${encodeURIComponent(
    `Table ${selectedTableNumber}`
  )}`;

  // Re-generate QR on canvas when selected table or vendor changes
  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        tableUrl,
        {
          width: 220,
          margin: 1,
          color: {
            dark: '#1e293b',
            light: '#ffffff'
          }
        },
        err => {
          if (err) console.error('QR code error', err);
        }
      );
    }
  }, [tableUrl, selectedTableNumber, activeVendor]);

  // Download QR code PNG
  const handleDownloadPng = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${activeVendor.slug}-table-${selectedTableNumber}-qr.png`;
      link.href = url;
      link.click();
    }
  };

  const handleAddTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNum.trim()) return;
    addTable(newTableNum.trim(), newCapacity);
    setSelectedTableNumber(newTableNum.trim());
    setNewTableNum('');
    setIsAddTableOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="font-heading font-bold text-base text-slate-900">
            Table & QR Code Generator
          </h2>
          <p className="text-xs text-slate-500">
            Generate custom QR codes for each table, download high-res files, and print table tent cards.
          </p>
        </div>

        <button
          onClick={() => setIsAddTableOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Table</span>
        </button>
      </div>

      {/* Main Grid: Tables Selector & QR Preview / Stand Template */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tables Directory */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-heading font-bold text-sm text-slate-900 uppercase tracking-wider">
            Restaurant Tables ({tables.length})
          </h3>

          <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
            {tables.map(tbl => (
              <div
                key={tbl.id}
                onClick={() => setSelectedTableNumber(tbl.tableNumber)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                  selectedTableNumber === tbl.tableNumber
                    ? 'border-orange-600 bg-orange-50/50 text-orange-950 font-bold ring-1 ring-orange-600'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs">Table #{tbl.tableNumber}</div>
                  <div className="text-[10px] text-slate-400">{tbl.capacity} seats</div>
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    if (tables.length <= 1) {
                      alert('At least one table is required.');
                      return;
                    }
                    if (confirm(`Delete Table #${tbl.tableNumber}?`)) {
                      deleteTable(tbl.id);
                    }
                  }}
                  className="p-1 text-slate-300 hover:text-rose-500 rounded"
                  title="Delete Table"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Printable Table Tent Card Stand */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">
                Table #{selectedTableNumber} Stand Template
              </h3>
              <p className="text-xs text-slate-400">
                Ready-to-print table tent with automatic table identification.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPng}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Tent Card</span>
              </button>
            </div>
          </div>

          {/* Realistic Acrylic Table Tent Mockup */}
          <div className="flex justify-center p-4">
            <div className="w-full max-w-xs bg-linear-to-b from-white to-slate-50 border-2 border-slate-300 rounded-3xl p-6 shadow-xl text-center space-y-4 printable-area">
              {/* Restaurant Header */}
              <div className="flex flex-col items-center gap-1.5">
                <img
                  src={activeVendor.logo}
                  alt={activeVendor.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                />
                <h4 className="font-heading font-extrabold text-base text-slate-900 tracking-tight leading-tight">
                  {activeVendor.name}
                </h4>
                <div className="inline-block bg-orange-600 text-white font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                  Table {selectedTableNumber}
                </div>
              </div>

              {/* QR Code Canvas */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 inline-block shadow-inner">
                <canvas ref={canvasRef} className="mx-auto block" />
              </div>

              {/* Instructions */}
              <div className="space-y-1">
                <div className="font-heading font-bold text-sm text-slate-900">
                  SCAN TO BROWSE & ORDER
                </div>
                <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto">
                  Open your camera, point at the code, view menu & pay from your phone.
                </p>
              </div>

              {/* WiFi info footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                <Wifi className="w-3 h-3 text-slate-400" />
                <span>Free Guest WiFi: &quot;{activeVendor.name}_Guest&quot;</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Table Modal */}
      {isAddTableOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-heading font-bold text-base text-slate-900">Add New Dining Table</h3>
            <form onSubmit={handleAddTableSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Table Number / Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g. 9 or VIP-1"
                  value={newTableNum}
                  onChange={e => setNewTableNum(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Seating Capacity
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={newCapacity}
                  onChange={e => setNewCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddTableOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-xs"
                >
                  Create Table & QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
