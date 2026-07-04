import React, { useState, useEffect } from 'react';
import api from '../../../axios_api/axios';

const SalaryInfoTab = ({ employee, currentUser, onUpdateSuccess }) => {
  const isAuthorized = currentUser?.role === 'Admin' || currentUser?.role === 'HR';

  if (!isAuthorized) {
    return (
      <div className="p-6 bg-[#FEF2F2] border border-[#FEE2E2] text-[#991B1B] rounded-xl font-semibold text-center flex flex-col items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-sm">Access Denied. You do not have permission to view or manage salary details.</p>
      </div>
    );
  }

  const dbSalary = employee.salary || {};

  const [wage, setWage] = useState(dbSalary.base ? dbSalary.base * 2 : 0);
  const [wageType, setWageType] = useState('Fixed wage');
  const [pfRate, setPfRate] = useState(12);
  const [profTax, setProfTax] = useState(200);

  const [basic, setBasic] = useState(0);
  const [hra, setHra] = useState(0);
  const [standardAllowance, setStandardAllowance] = useState(4167);
  const [perfBonus, setPerfBonus] = useState(0);
  const [lta, setLta] = useState(0);
  const [fixedAllowance, setFixedAllowance] = useState(0);
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const W = Number(wage) || 0;
    
    const calculatedBasic = Math.round(W * 0.5);
    const calculatedHra = Math.round(calculatedBasic * 0.5);
    const calculatedStdAllowance = 4167;
    const calculatedPerfBonus = Math.round(W * 0.0833);
    const calculatedLta = Math.round(W * 0.08333);
    
    const totalComponents = calculatedBasic + calculatedHra + calculatedStdAllowance + calculatedPerfBonus + calculatedLta;
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

      const response = await api.put(`/create/${employee._id}`, {
        salary: {
          base: basic,
          hra: hra,
          allowances: standardAllowance
        }
      });

      if (response.data.success) {
        setMessage('Salary details updated and calculated successfully!');
        if (onUpdateSuccess) onUpdateSuccess(response.data.data);
        
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error saving salary info:', err);
      setError(err.response?.data?.message || 'Failed to update salary details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#F1EDF0] shadow-sm overflow-hidden font-sans">
      <div className="px-6 py-4 flex items-center justify-between border-b border-[#F1EDF0] bg-[#FDFCFD]">
        <h2 className="text-sm font-semibold text-[#392634]">Salary Structure & Compensation</h2>
        <span className="bg-[#F1EDF0] text-[#714B67] text-xs px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
          {wageType}
        </span>
      </div>

      <form onSubmit={handleSaveSalary} className="p-6 space-y-6">
        
        {/* Core Wage Configurations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-[#F9F9FB] p-5 rounded-lg border border-[#F1EDF0]">
          <div>
            <label className="block text-xs font-semibold text-[#9C8195] uppercase tracking-wider mb-2">Wage Type</label>
            <select
              value={wageType}
              onChange={(e) => setWageType(e.target.value)}
              className="w-full bg-[#FDFCFD] border border-[#F1EDF0] rounded-md text-sm p-2.5 focus:outline-none focus:border-[#714B67]"
            >
              <option value="Fixed wage">Fixed wage</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9C8195] uppercase tracking-wider mb-2">Monthly Wage (₹)</label>
            <input
              type="number"
              value={wage}
              onChange={(e) => setWage(e.target.value)}
              className="w-full bg-[#FDFCFD] border border-[#F1EDF0] rounded-md text-sm p-2.5 focus:outline-none focus:border-[#714B67] font-semibold text-[#392634]"
              placeholder="e.g. 50000"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9C8195] uppercase tracking-wider mb-2">PF Rate (%)</label>
            <input
              type="number"
              value={pfRate}
              onChange={(e) => setPfRate(e.target.value)}
              className="w-full bg-[#FDFCFD] border border-[#F1EDF0] rounded-md text-sm p-2.5 focus:outline-none focus:border-[#714B67] font-semibold text-[#392634]"
              placeholder="12"
              required
            />
          </div>
        </div>

        {/* Calculated Components Section */}
        <div>
          <h3 className="text-xs font-semibold text-[#9C8195] uppercase tracking-wider mb-3">Calculated Salary Components</h3>
          <div className="overflow-hidden border border-[#F1EDF0] rounded-lg">
            <table className="w-full text-left text-sm text-[#585D68] border-collapse">
              <thead className="bg-[#FDFCFD] border-b border-[#F1EDF0]">
                <tr>
                  <th className="p-3 font-semibold text-xs text-[#9C8195] uppercase tracking-wider">Salary Component</th>
                  <th className="p-3 font-semibold text-xs text-[#9C8195] uppercase tracking-wider">Computation Type</th>
                  <th className="p-3 font-semibold text-xs text-[#9C8195] uppercase tracking-wider">Rate / Percentage</th>
                  <th className="p-3 font-semibold text-xs text-[#9C8195] uppercase tracking-wider text-right">Computed Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EDF0]">
                <tr>
                  <td className="p-3 font-medium text-[#392634]">Basic (Base)</td>
                  <td className="p-3 text-xs text-[#9C8195]">Percentage of Wage</td>
                  <td className="p-3 font-medium text-[#392634]">50.00%</td>
                  <td className="p-3 font-medium text-[#392634] text-right">₹{basic.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-[#392634]">House Rent Allowance (HRA)</td>
                  <td className="p-3 text-xs text-[#9C8195]">Percentage of Basic</td>
                  <td className="p-3 font-medium text-[#392634]">50.00%</td>
                  <td className="p-3 font-medium text-[#392634] text-right">₹{hra.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-[#392634]">Standard Allowance</td>
                  <td className="p-3 text-xs text-[#9C8195]">Fixed Amount</td>
                  <td className="p-3 font-medium text-[#392634]">Fixed</td>
                  <td className="p-3 font-medium text-[#392634] text-right">₹{standardAllowance.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-[#714B67]">Performance Bonus</td>
                  <td className="p-3 text-xs text-[#9C8195]">Percentage of Wage</td>
                  <td className="p-3 font-medium text-[#392634]">8.33%</td>
                  <td className="p-3 font-medium text-[#392634] text-right">₹{perfBonus.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-[#392634]">Leave Travel Allowance (LTA)</td>
                  <td className="p-3 text-xs text-[#9C8195]">Percentage of Wage</td>
                  <td className="p-3 font-medium text-[#392634]">8.333%</td>
                  <td className="p-3 font-medium text-[#392634] text-right">₹{lta.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="bg-[#F1EDF0]/50">
                  <td className="p-3 font-medium text-[#714B67]">Fixed Allowance (Residual)</td>
                  <td className="p-3 text-xs text-[#714B67] font-medium">Wage - Total Components</td>
                  <td className="p-3 text-xs text-[#9C8195]">Residual balance</td>
                  <td className="p-3 font-medium text-[#714B67] text-right">
                    {fixedAllowance < 0 ? (
                      <span className="text-[#991B1B]">₹{fixedAllowance.toLocaleString('en-IN')} (Exceeded)</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-[#F9F9FB] p-5 rounded-lg border border-[#F1EDF0]">
          <div>
            <label className="block text-xs font-semibold text-[#9C8195] uppercase tracking-wider mb-2">Professional Tax (₹)</label>
            <input
              type="number"
              value={profTax}
              onChange={(e) => setProfTax(e.target.value)}
              className="w-full bg-[#FDFCFD] border border-[#F1EDF0] rounded-md text-sm p-2.5 focus:outline-none focus:border-[#714B67] font-semibold text-[#392634]"
              placeholder="200"
              required
            />
          </div>

          <div className="flex flex-col justify-end">
            <div className="flex items-center justify-between border-t border-[#F1EDF0] pt-4 mt-2">
              <span className="text-xs font-semibold text-[#9C8195]">Cumulative Component Total:</span>
              <span className="text-sm font-bold text-[#392634]">
                ₹{totalCalculated.toLocaleString('en-IN')} / ₹{Number(wage).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {error && <div className="p-3 bg-[#FEF2F2] border border-[#FEE2E2] text-[#991B1B] rounded-md text-sm">{error}</div>}
        {message && <div className="p-3 bg-[#E9F8F5] border border-[#A7F3D0] text-[#115C4D] rounded-md text-sm">{message}</div>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || isExceeded}
            className="bg-[#714B67] hover:bg-[#4F3548] text-white px-5 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save & Persist Salary'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default SalaryInfoTab;