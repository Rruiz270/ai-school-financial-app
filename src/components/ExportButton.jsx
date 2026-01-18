import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, ChevronDown, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ExportButton = ({
  exportOptions = [],
  onExport,
  buttonText = 'Export',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optionId) => {
    setSelectedOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const selectAll = () => {
    setSelectedOptions(exportOptions.map(opt => opt.id));
  };

  const clearAll = () => {
    setSelectedOptions([]);
  };

  const handleExport = () => {
    if (selectedOptions.length === 0) {
      alert('Please select at least one item to export');
      return;
    }

    if (onExport) {
      onExport(selectedOptions);
    }
    setIsOpen(false);
    setSelectedOptions([]);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Main Export Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
      >
        <FileSpreadsheet className="w-5 h-5" />
        <span className="font-medium">{buttonText}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <h3 className="font-semibold text-gray-800">Export to Excel</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto p-2">
            {exportOptions.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option.id)}
                  onChange={() => toggleOption(option.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-gray-500">{option.description}</div>
                  )}
                </div>
              </label>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-600 hover:text-gray-800"
                >
                  Clear All
                </button>
              </div>
              <span className="text-xs text-gray-500">
                {selectedOptions.length} selected
              </span>
            </div>
            <button
              onClick={handleExport}
              disabled={selectedOptions.length === 0}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedOptions.length > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              Export Selected
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Excel Export Utility Functions
export const exportToExcel = (sheets, filename = 'export') => {
  const workbook = XLSX.utils.book_new();

  sheets.forEach(({ name, data }) => {
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Auto-size columns
    const colWidths = data.length > 0
      ? Object.keys(data[0]).map(key => ({
          wch: Math.max(
            key.length,
            ...data.map(row => String(row[key] || '').length)
          ) + 2
        }))
      : [];
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, name.substring(0, 31)); // Excel sheet names max 31 chars
  });

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Format currency for export
export const formatCurrencyForExport = (value) => {
  if (value === null || value === undefined) return '';
  return Number(value);
};

// Format percentage for export
export const formatPercentageForExport = (value) => {
  if (value === null || value === undefined) return '';
  return Number((value * 100).toFixed(2));
};

export default ExportButton;
