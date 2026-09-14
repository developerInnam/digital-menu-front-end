import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Customer } from '../../../types';
import {
  Users,
  Search,
  Award,
  Phone,
  MessageSquare,
  ShoppingBag,
  Heart,
  Send,
  CheckCircle2,
  X
} from 'lucide-react';

export const CustomersTab: React.FC = () => {
  const { customers, activeVendor } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerForWhatsApp, setSelectedCustomerForWhatsApp] = useState<Customer | null>(null);
  const [whatsappMessage, setWhatsappMessage] = useState(
    `Hello! Enjoy 20% OFF your next dine-in visit at ${activeVendor.name}. Use code WEEKEND20 when scanning table QR!`
  );
  const [sentNotice, setSentNotice] = useState(false);

  const filteredCustomers = customers.filter(c => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerForWhatsApp) return;

    // Direct WhatsApp web API link
    const cleanPhone = selectedCustomerForWhatsApp.phone.replace(/[^0-9]/g, '');
    const encodedMsg = encodeURIComponent(whatsappMessage);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
    window.open(waUrl, '_blank');

    setSentNotice(true);
    setTimeout(() => {
      setSentNotice(false);
      setSelectedCustomerForWhatsApp(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="font-heading font-bold text-base text-slate-900">
            Customer Directory & Loyalty
          </h2>
          <p className="text-xs text-slate-500">
            Diner profiles, re-order history, loyalty rewards, and direct WhatsApp re-engagement.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Orders</th>
                <th className="py-3.5 px-4">Total Spent</th>
                <th className="py-3.5 px-4">Loyalty Points</th>
                <th className="py-3.5 px-4">Favorite Dishes</th>
                <th className="py-3.5 px-4 text-right">Engage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map(cust => (
                <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs uppercase">
                        {cust.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{cust.name}</div>
                        <div className="text-[11px] text-slate-400">
                          Last visit: {cust.lastVisited}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="flex items-center gap-1 font-medium">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{cust.phone}</span>
                    </div>
                    {cust.email && (
                      <div className="text-[10px] text-slate-400">{cust.email}</div>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    {cust.totalOrders} visits
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {activeVendor.currency}
                    {cust.totalSpent.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>{cust.loyaltyPoints} pts</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {cust.favoriteDishes?.map((fav, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-700"
                        >
                          {fav}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedCustomerForWhatsApp(cust);
                        setWhatsappMessage(
                          `Hello ${cust.name}! We'd love to welcome you back at ${activeVendor.name}. You have ${cust.loyaltyPoints} points available. Enjoy 20% OFF today using code SAVE20!`
                        );
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* WhatsApp Message Outreach Modal */}
      {selectedCustomerForWhatsApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="font-heading font-bold text-base text-slate-900">
                  WhatsApp Direct Message
                </h3>
              </div>
              <button
                onClick={() => setSelectedCustomerForWhatsApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendWhatsApp} className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <div className="text-slate-500">Recipient:</div>
                <div className="font-bold text-slate-900">
                  {selectedCustomerForWhatsApp.name} ({selectedCustomerForWhatsApp.phone})
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message Content
                </label>
                <textarea
                  rows={4}
                  value={whatsappMessage}
                  onChange={e => setWhatsappMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCustomerForWhatsApp(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send via WhatsApp</span>
                </button>
              </div>

              {sentNotice && (
                <div className="flex items-center justify-center gap-1 text-xs text-emerald-600 font-semibold pt-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Opening WhatsApp conversation...</span>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
