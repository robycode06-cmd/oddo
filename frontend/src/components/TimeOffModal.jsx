import React, { useState } from 'react';
import api from '../../axios_api/axios';

const TimeOffModal = ({ isOpen, onClose, token }) => {

    const [formData, setFormData] = useState({
        leaveType: 'Paid',
        startDate: '',
        endDate: ''
    });

    const [File, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    if(!isOpen) return null;

    const calculateDays = (start, end) => {
        if(!start || !end) return 0;
        const diffTime = Math.abs(new Date(end) - new Date(start));
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    const allocatedDays = calculateDays(formData.startDate, formData.endDate);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('leaveType', formData.leaveType);
        data.append('startDate', formData.startDate);
        data.append('endDate', formData.endDate);
        data.append('allocatedDays', allocatedDays);
        if(File) data.append('attachment', File);

        try {
            await api.post('/api/leave/request', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            onClose();
        } catch(error) {
            console.error('Error submitting time off request:', error);
        } finally {
            setLoading(false);
        }
    }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#392634]/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-[#714B67]/10">

        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#392634]">New Time Off Request</h2>
              <p className="text-sm text-[#9C8195] mt-1">Fill in the details below</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#C6B7C2] hover:text-[#714B67] hover:bg-[#F1EDF0] transition-colors -mr-1 -mt-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#F1EDF0] mx-8" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">

          {/* Time Off Type */}
          <div>
            <label className="block text-xs font-semibold text-[#9C8195] uppercase tracking-wider mb-2">
              Type
            </label>
            <select
              className="w-full px-4 py-3 bg-[#FEFFFF] border border-[#F1EDF0] rounded-xl text-[#392634] text-sm font-medium focus:border-[#714B67]"
              value={formData.leaveType}
              onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
            >
              <option value="Paid">Paid Time Off</option>
              <option value="Sick">Sick Leave</option>
              <option value="Unpaid">Unpaid Leave</option>
            </select>
          </div>

          {/* Dates */}
          <div>
            <label className="block text-xs font-semibold text-[#9C8195] uppercase tracking-wider mb-2">
              Period
            </label>
            <div className="flex items-center gap-3">
              <input
                type="date"
                className="flex-1 px-4 py-3 bg-[#FEFFFF] border border-[#F1EDF0] rounded-xl text-[#392634] text-sm focus:border-[#714B67]"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                required
              />
              <span className="text-xs font-semibold text-[#C6B7C2] uppercase">to</span>
              <input
                type="date"
                className="flex-1 px-4 py-3 bg-[#FEFFFF] border border-[#F1EDF0] rounded-xl text-[#392634] text-sm focus:border-[#714B67]"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                required
              />
            </div>
          </div>

          {/* Allocation */}
          <div>
            <label className="block text-xs font-semibold text-[#9C8195] uppercase tracking-wider mb-2">
              Allocation
            </label>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E6F2F3]">
              <svg className="w-4 h-4 text-[#017E84]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-bold text-[#017E84]">
                {allocatedDays > 0 ? `${allocatedDays} Day${allocatedDays > 1 ? 's' : ''}` : '0 Days'}
              </span>
            </div>
          </div>

          {/* Attachment — Sick Leave only */}
          {formData.leaveType === 'Sick' && (
            <div>
              <label className="block text-xs font-semibold text-[#9C8195] uppercase tracking-wider mb-2">
                Attachment
              </label>
              <div className="p-4 border-2 border-dashed border-[#F1EDF0] rounded-xl hover:border-[#C6B7C2] transition-colors">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="block w-full text-sm text-[#9C8195] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#714B67] file:text-white hover:file:bg-[#4F3548] file:cursor-pointer"
                />
                <p className="text-xs text-[#C6B7C2] mt-2">Upload sick leave certificate</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || allocatedDays <= 0}
              className="flex-1 py-3 text-sm font-semibold text-white bg-[#714B67] rounded-xl hover:bg-[#4F3548] active:scale-[0.98] shadow-lg shadow-[#714B67]/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2 justify-center">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting…
                </span>
              ) : 'Submit Request'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-semibold text-[#9C8195] bg-[#F1EDF0] rounded-xl hover:bg-[#C6B7C2] hover:text-white transition-all"
            >
              Discard
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TimeOffModal;