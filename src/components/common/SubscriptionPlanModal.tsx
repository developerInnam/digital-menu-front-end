import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2 } from 'lucide-react';
import { SubscriptionPlan } from '../../data/subscriptionPlans';

interface SubscriptionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plans: SubscriptionPlan[]) => void;
  existingPlans?: SubscriptionPlan[];
}

export const SubscriptionPlanModal: React.FC<SubscriptionPlanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingPlans = []
}) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(existingPlans);
  const [newPlan, setNewPlan] = useState<Partial<SubscriptionPlan>>({
    name: '',
    price: '',
    priceNumeric: 0,
    desc: '',
    features: [],
    tablesLimit: 10,
    isActive: true
  });
  const [isUnlimitedTables, setIsUnlimitedTables] = useState(false);
  const [featureInput, setFeatureInput] = useState('');
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddFeature = () => {
    if (featureInput.trim() && newPlan.features) {
      setNewPlan({
        ...newPlan,
        features: [...newPlan.features, featureInput.trim()]
      });
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    if (newPlan.features) {
      setNewPlan({
        ...newPlan,
        features: newPlan.features.filter((_, i) => i !== index)
      });
    }
  };

  const handleAddPlan = () => {
    if (!newPlan.name || !newPlan.price || !newPlan.desc) {
      alert('Please fill in all required fields');
      return;
    }

    const plan: SubscriptionPlan = {
      id: newPlan.name.toLowerCase().replace(/\s+/g, '-'),
      name: newPlan.name,
      price: newPlan.price,
      priceNumeric: newPlan.priceNumeric || 0,
      desc: newPlan.desc,
      features: newPlan.features || [],
      tablesLimit: isUnlimitedTables ? -1 : (newPlan.tablesLimit || 10),
      isActive: newPlan.isActive !== false
    };

    setPlans([...plans, plan]);
    setNewPlan({
      name: '',
      price: '',
      priceNumeric: 0,
      desc: '',
      features: [],
      tablesLimit: 10,
      isActive: true
    });
    setIsUnlimitedTables(false);
  };

  const handleDeletePlan = (id: string) => {
    setPlans(plans.filter(plan => plan.id !== id));
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlanId(plan.id);
    setNewPlan({
      name: plan.name,
      price: plan.price,
      priceNumeric: plan.priceNumeric,
      desc: plan.desc,
      features: plan.features,
      tablesLimit: plan.tablesLimit === -1 ? 10 : plan.tablesLimit,
      isActive: plan.isActive
    });
    setIsUnlimitedTables(plan.tablesLimit === -1);
  };

  const handleUpdatePlan = () => {
    if (!newPlan.name || !newPlan.price || !newPlan.desc || !editingPlanId) {
      alert('Please fill in all required fields');
      return;
    }

    const updatedPlan: SubscriptionPlan = {
      id: editingPlanId,
      name: newPlan.name,
      price: newPlan.price,
      priceNumeric: newPlan.priceNumeric || 0,
      desc: newPlan.desc,
      features: newPlan.features || [],
      tablesLimit: isUnlimitedTables ? -1 : (newPlan.tablesLimit || 10),
      isActive: newPlan.isActive !== false
    };

    setPlans(plans.map(plan => plan.id === editingPlanId ? updatedPlan : plan));
    setEditingPlanId(null);
    setNewPlan({
      name: '',
      price: '',
      priceNumeric: 0,
      desc: '',
      features: [],
      tablesLimit: 10,
      isActive: true
    });
    setIsUnlimitedTables(false);
  };

  const handleCancelEdit = () => {
    setEditingPlanId(null);
    setNewPlan({
      name: '',
      price: '',
      priceNumeric: 0,
      desc: '',
      features: [],
      tablesLimit: 10,
      isActive: true
    });
    setIsUnlimitedTables(false);
  };

  const handleSave = () => {
    onSave(plans);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Manage Subscription Plans</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Existing Plans */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-700 mb-3">Existing Plans</h3>
          {plans.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No plans added yet</p>
          ) : (
            <div className="space-y-3">
              {plans.map(plan => (
                <div
                  key={plan.id}
                  className="p-4 border border-slate-200 rounded-xl bg-slate-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{plan.name}</span>
                        <span className="text-sm font-bold text-orange-600">{plan.price}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{plan.desc}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                          {plan.tablesLimit === -1 ? 'Unlimited Tables' : `${plan.tablesLimit} Tables`}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {plan.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditPlan(plan)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Plan Form */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-sm font-bold text-slate-700 mb-3">
            {editingPlanId ? 'Edit Plan' : 'Add New Plan'}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Plan Name *</label>
                <input
                  type="text"
                  value={newPlan.name}
                  onChange={e => setNewPlan({ ...newPlan, name: e.target.value })}
                  placeholder="e.g., Starter, Pro, Enterprise"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Price *</label>
                <input
                  type="text"
                  value={newPlan.price}
                  onChange={e => setNewPlan({ ...newPlan, price: e.target.value })}
                  placeholder="e.g., ₹1,499/mo"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Price (Numeric)</label>
                <input
                  type="number"
                  value={newPlan.priceNumeric}
                  onChange={e => setNewPlan({ ...newPlan, priceNumeric: Number(e.target.value) })}
                  placeholder="1499"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tables Limit</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="unlimited-tables"
                    checked={isUnlimitedTables}
                    onChange={e => setIsUnlimitedTables(e.target.checked)}
                    className="w-4 h-4 accent-orange-600 rounded"
                  />
                  <label htmlFor="unlimited-tables" className="text-xs text-slate-600">Unlimited</label>
                </div>
                {!isUnlimitedTables && (
                  <input
                    type="number"
                    value={newPlan.tablesLimit}
                    onChange={e => setNewPlan({ ...newPlan, tablesLimit: Number(e.target.value) })}
                    placeholder="10"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Description *</label>
              <textarea
                value={newPlan.desc}
                onChange={e => setNewPlan({ ...newPlan, desc: e.target.value })}
                placeholder="Describe what this plan includes..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Features</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={featureInput}
                  onChange={e => setFeatureInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                  placeholder="Add a feature and press Enter"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {newPlan.features && newPlan.features.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {newPlan.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs"
                    >
                      {feature}
                      <button
                        onClick={() => handleRemoveFeature(idx)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {editingPlanId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm font-bold"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={editingPlanId ? handleUpdatePlan : handleAddPlan}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-bold"
              >
                {editingPlanId ? 'Update Plan' : 'Add Plan'}
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-bold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors text-sm font-bold"
          >
            Save Plans
          </button>
        </div>
      </div>
    </div>
  );
};
