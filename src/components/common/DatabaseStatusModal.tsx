import React, { useState } from 'react';
import {
  Database,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { DbStatusData } from '../../services/api';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbStatus: DbStatusData | null;
  onReseed: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({
  isOpen,
  onClose,
  dbStatus,
  onReseed,
  onRefresh
}) => {
  const [isReseeding, setIsReseeding] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReseed = async () => {
    try {
      setIsReseeding(true);
      setFeedback(null);
      await onReseed();
      setFeedback('✅ Successfully refreshed & re-seeded database with sample restaurants, menus, and orders!');
    } catch (err: any) {
      setFeedback(`❌ Re-seed failed: ${err.message}`);
    } finally {
      setIsReseeding(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setFeedback(null);
      await onRefresh();
      setFeedback('✅ Live status updated from Node.js Express server.');
    } catch (err: any) {
      setFeedback(`❌ Refresh failed: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const isMongoLive = dbStatus?.engine === 'mongodb' && dbStatus.isConnected;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Node.js Express + MongoDB Stack</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${isMongoLive
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                  {isMongoLive ? 'MongoDB Live' : 'Dynamic Mongoose Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-500">Real-time REST API, Mongoose models, and persistent data layer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Server & DB Status Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <Server className="w-3.5 h-3.5 text-indigo-500" />
                Backend Engine
              </div>
              <div className="font-bold text-slate-900 text-sm">Node.js + Express.js</div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active on Port 3000
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                Database Engine
              </div>
              <div className="font-bold text-slate-900 text-sm">
                {isMongoLive ? 'MongoDB (Connected)' : 'MongoDB ODM (Mongoose)'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 truncate" title={dbStatus?.dbName}>
                DB: <span className="font-mono text-slate-700">{dbStatus?.dbName || 'dinesmart'}</span>
              </div>
            </div>
          </div>

          {/* Connection Overview Banner */}
          <div className={`p-4 rounded-2xl border ${isMongoLive
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/70 border-amber-200 text-amber-950'
            }`}>
            <div className="flex items-start gap-3">
              {isMongoLive ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              )}
              <div className="space-y-1">
                <h4 className="font-bold text-xs uppercase tracking-wider">
                  {isMongoLive ? 'Cluster Connection Active' : 'Resilient Dynamic Store Active'}
                </h4>
                <p className="text-xs leading-relaxed opacity-90">
                  {dbStatus?.message ||
                    'Your application is executing dynamic Express REST calls with structured Mongoose schemas.'}
                </p>
                {dbStatus?.uriPreview && (
                  <div className="text-[11px] font-mono bg-white/70 px-2.5 py-1 rounded-lg border border-black/5 mt-2 truncate">
                    URI: {dbStatus.uriPreview}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Live Data Counts from Backend */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Live Database Collections
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <div className="text-lg font-bold text-slate-900">{dbStatus?.counts.vendors ?? '-'}</div>
                <div className="text-[11px] text-slate-500 font-medium">Vendors</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <div className="text-lg font-bold text-slate-900">{dbStatus?.counts.products ?? '-'}</div>
                <div className="text-[11px] text-slate-500 font-medium">Dishes</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <div className="text-lg font-bold text-slate-900">{dbStatus?.counts.orders ?? '-'}</div>
                <div className="text-[11px] text-slate-500 font-medium">Orders</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <div className="text-lg font-bold text-slate-900">{dbStatus?.counts.tables ?? '-'}</div>
                <div className="text-[11px] text-slate-500 font-medium">Tables</div>
              </div>
            </div>
          </div>

          {/* Feedback banner if any */}
          {feedback && (
            <div className="p-3 bg-slate-900 text-white rounded-xl text-xs flex items-center justify-between animate-in fade-in duration-200">
              <span>{feedback}</span>
              <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* External MongoDB Setup Guidance */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-orange-600" />
              Connecting to MongoDB Atlas or Custom Instance:
            </div>
            <p className="text-slate-600 leading-relaxed">
              To connect to a live remote MongoDB Atlas cluster, define <code className="px-1.5 py-0.5 bg-slate-200 rounded font-mono text-[11px]">MONGODB_URI</code> in your project environment:
            </p>
            <div className="bg-slate-900 text-emerald-400 font-mono text-[11px] p-2.5 rounded-xl select-all overflow-x-auto">
              MONGODB_URI=mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster.mongodb.net/dinesmart?retryWrites=true&amp;w=majority
            </div>
            <p className="text-[11px] text-slate-500">
              The Node.js Express server automatically reconnects on restart and syncs all REST API collections!
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200/80 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Check DB Status</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReseed}
              disabled={isReseeding}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors flex items-center gap-1.5"
              title="Reset and seed sample restaurant records into MongoDB"
            >
              <Sparkles className={`w-3.5 h-3.5 text-orange-600 ${isReseeding ? 'animate-spin' : ''}`} />
              <span>{isReseeding ? 'Seeding...' : 'Reset & Seed DB'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
