import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SalaryInfoTab = ({ employee, currentUser, onUpdateSuccess }) => {
  // 1. Role-based Access Check: Only Admin or HR roles can access the Salary Info tab
  const isAuthorized = currentUser?.role === 'Admin' || currentUser?.role === 'HR';

  if (!isAuthorized) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-semibold text-center flex flex-col items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-sm">Access Denied. You do not have permission to view or manage salary details.</p>
      </div>
    );
  }

  // Retrieve current salary object from db schema properties: base (Basic), hra (HRA), allowances (Standard)
  const dbSalary = employee.salary || {};

  // Form State: Reconstruct total Wage from saved base (Basic) salary (Basic = 50% of Wage)
  const [wage, setWage] = useState(dbSalary.base ? dbSalary.base * 2 : 0);
  const [wageType, setWageType] = useState('Fixed wage');
  const [pfRate, setPfRate] = useState(12);
  const [profTax, setProfTax] = useState(200);

  // Computations State (Calculated dynamically on the client side for rendering)
  const [basic, setBasic] = useState(0);
  const [hra, setHra] = useState(0);
  const [standardAllowance, setStandardAllowance] = useState(4167);
  const [perfBonus, setPerfBonus] = useState(0);
  const [lta, setLta] = useState(0);
  const [fixedAllowance, setFixedAllowance] = useState(0);
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // 2. Auto-calculation Logic: Triggers whenever wage changes
  useEffect(() => {
    const W = Number(wage) || 0;
    
    // Basic = 50% of wage
    const calculatedBasic = Math.round(W * 0.5);
    
    // HRA = 50% of Basic
    const calculatedHra = Math.round(calculatedBasic * 0.5);
    
    // Standard Allowance = Fixed 4167
    const calculatedStdAllowance = 4167;
    
    // Performance Bonus = 8.33% of wage
    const calculatedPerfBonus = Math.round(W * 0.0833);
    
    // Leave Travel Allowance (LTA) = 8.333% of wage
    const calculatedLta = Math.round(W * 0.08333);
    
    // Total of computed components
    const totalComponents = calculatedBasic + calculatedHra + calculatedStdAllowance + calculatedPerfBonus + calculatedLta;
    
    // Fixed Allowance = Wage - Total of all components
    const calculatedFixedAllowance = W - totalComponents;

    setBasic(calculatedBasic);
    setHra(calculatedHra);
    setStandardAllowance(calculatedStdAllowance);
    setPerfBonus(calculatedPerfBonus);
    setLta(calculatedLta);
    setFixedAllowance(calculatedFixedAllowance);
  }, [wage]);

  const totalCalculated = basic + hra + standardAllowance + perfBonus + lta + fixedAllowance;
  const isExceeded = totalCalculated > wage;

  // 3. Handle Form Submit - Save Salary Settings directly to the backend database
  const handleSaveSalary = async (e) => {
    e.preventDefault();
    if (isExceeded) {
      setError('Error: Total of all salary components cannot exceed the defined Wage.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await axios.put(
        `${API_BASE_URL}/users/profile/${employee._id}`,
        {
          salary: {
            base: basic,        // Maps to Basic
            hra: hra,          // Maps to House Rent Allowance
            allowances: standardAllowance // Maps to Standard Allowance
          }
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setMessage('Salary details updated and calculated successfully!');
        if (onUpdateSuccess) {
          onUpdateSuccess(response.data.data);
        }
      }

    } catch (err) {
      console.error('Error saving salary info:', err);
      setError(err.response?.data?.message || 'Failed to update salary details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm font-sans max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-base font-bold text-slate-800">Salary Structure & Compensation</h2>
          <p className="text-xs text-slate-500 mt-1">Manage core salary components, wage structures, and automatic calculators.</p>
        </div>
        <span className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-md font-bold border border-purple-100 uppercase tracking-wider">
          {wageType}
        </span>
      </div>

      <form onSubmit={handleSaveSalary} className="space-y-6">
        
        {/* Core Wage Configurations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Wage Type</label>
            <select
              value={wageType}
              onChange={(e) => setWageType(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg text-sm p-2.5 focus:outline-none focus:border-purple-600 font-medium"
            >
              <option value="Fixed wage">Fixed wage</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Monthly Wage (₹)</label>
            <input
              type="number"
              value={wage}
              onChange={(e) => setWage(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg text-sm p-2.5 focus:outline-none focus:border-purple-600 font-bold text-slate-800"
              placeholder="e.g. 50000"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">PF Rate (%)</label>
            <input
              type="number"
              value={pfRate}
              onChange={(e) => setPfRate(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg text-sm p-2.5 focus:outline-none focus:border-purple-600 font-semibold text-slate-800"
              placeholder="12"
              required
            />
          </div>
        </div>

        {/* Calculated Components Section */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Calculated Salary Components</h3>
          <div className="overflow-hidden border border-slate-200 rounded-xl shadow-inner">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-3 font-bold text-xs text-slate-500 uppercase tracking-wider">Salary Component</th>
                  <th className="p-3 font-bold text-xs text-slate-500 uppercase tracking-wider">Computation Type</th>
                  <th className="p-3 font-bold text-xs text-slate-500 uppercase tracking-wider">Rate / Percentage</th>
                  <th className="p-3 font-bold text-xs text-slate-500 uppercase tracking-wider text-right">Computed Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-bold text-slate-800">Basic (Base)</td>
                  <td className="p-3 text-xs text-slate-500">Percentage of Wage</td>
                  <td className="p-3 font-semibold text-slate-700">50.00%</td>
                  <td className="p-3 font-bold text-slate-800 text-right">₹{basic.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-800">House Rent Allowance (HRA)</td>
                  <td className="p-3 text-xs text-slate-500">Percentage of Basic</td>
                  <td className="p-3 font-semibold text-slate-700">50.00%</td>
                  <td className="p-3 font-bold text-slate-800 text-right">₹{hra.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-800">Standard Allowance</td>
                  <td className="p-3 text-xs text-slate-500">Fixed Amount</td>
                  <td className="p-3 font-semibold text-slate-700">Fixed</td>
                  <td className="p-3 font-bold text-slate-800 text-right">₹{standardAllowance.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-[#875A7B]">Performance Bonus</td>
                  <td className="p-3 text-xs text-slate-500">Percentage of Wage</td>
                  <td className="p-3 font-semibold text-slate-700">8.33%</td>
                  <td className="p-3 font-bold text-slate-800 text-right">₹{perfBonus.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-800">Leave Travel Allowance (LTA)</td>
                  <td className="p-3 text-xs text-slate-500">Percentage of Wage</td>
                  <td className="p-3 font-semibold text-slate-700">8.333%</td>
                  <td className="p-3 font-bold text-slate-800 text-right">₹{lta.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="bg-purple-50/20">
                  <td className="p-3 font-bold text-[#875A7B]">Fixed Allowance (Residual)</td>
                  <td className="p-3 text-xs text-purple-500 font-semibold">Wage - Total Components</td>
                  <td className="p-3 text-xs text-slate-400">Residual balance</td>
                  <td className="p-3 font-bold text-[#875A7B] text-right">
                    {fixedAllowance < 0 ? (
                      <span className="text-rose-600">₹{fixedAllowance.toLocaleString('en-IN')} (Exceeded)</span>
                    ) : (
                      <span>₹{fixedAllowance.toLocaleString('en-IN')}</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Deductions & Statutory Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Professional Tax (₹)</label>
            <input
              type="number"
              value={profTax}
              onChange={(e) => setProfTax(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg text-sm p-2.5 focus:outline-none focus:border-purple-600 font-semibold text-slate-800"
              placeholder="200"
              required
            />
          </div>

          <div className="flex flex-col justify-end">
            <div className="flex items-center justify-between border-t border-slate-200/80 pt-3">
              <span className="text-xs font-bold text-slate-500">Cumulative Component Total:</span>
              <span className="text-sm font-black text-slate-800">
                ₹{totalCalculated.toLocaleString('en-IN')} / ₹{Number(wage).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {message && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">
            {message}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={saving || isExceeded}
            style={{ backgroundColor: '#875A7B' }}
            className="text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save & Persist Salary'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default SalaryInfoTab;