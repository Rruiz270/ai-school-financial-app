import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Download, FileSpreadsheet, ChevronDown, X, ChevronRight } from 'lucide-react';
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
  const [expandedCategories, setExpandedCategories] = useState({});
  const dropdownRef = useRef(null);

  // Group options by category
  const groupedOptions = useMemo(() => {
    const groups = {};
    exportOptions.forEach(option => {
      const category = option.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(option);
    });
    return groups;
  }, [exportOptions]);

  // Initialize all categories as expanded
  useEffect(() => {
    const initialExpanded = {};
    Object.keys(groupedOptions).forEach(cat => {
      initialExpanded[cat] = true;
    });
    setExpandedCategories(initialExpanded);
  }, [groupedOptions]);

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

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const selectAllInCategory = (category) => {
    const categoryOptionIds = groupedOptions[category].map(opt => opt.id);
    setSelectedOptions(prev => {
      const withoutCategory = prev.filter(id => !categoryOptionIds.includes(id));
      return [...withoutCategory, ...categoryOptionIds];
    });
  };

  const clearCategory = (category) => {
    const categoryOptionIds = groupedOptions[category].map(opt => opt.id);
    setSelectedOptions(prev => prev.filter(id => !categoryOptionIds.includes(id)));
  };

  const isCategoryFullySelected = (category) => {
    const categoryOptionIds = groupedOptions[category].map(opt => opt.id);
    return categoryOptionIds.every(id => selectedOptions.includes(id));
  };

  const isCategoryPartiallySelected = (category) => {
    const categoryOptionIds = groupedOptions[category].map(opt => opt.id);
    const selectedCount = categoryOptionIds.filter(id => selectedOptions.includes(id)).length;
    return selectedCount > 0 && selectedCount < categoryOptionIds.length;
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

    // Store options before clearing state
    const optionsToExport = [...selectedOptions];

    // Close dropdown and clear selections first
    setIsOpen(false);
    setSelectedOptions([]);

    // Then trigger export with stored options
    if (onExport) {
      try {
        onExport(optionsToExport);
      } catch (error) {
        alert('Export error: ' + error.message);
      }
    }
  };

  const categoryColors = {
    'General': 'bg-purple-100 text-purple-700',
    'Private Sector': 'bg-blue-100 text-blue-700',
    'Public Sector': 'bg-green-100 text-green-700',
    'Consolidated': 'bg-orange-100 text-orange-700',
    'Cash Flow': 'bg-teal-100 text-teal-700',
    'Unit Economics': 'bg-pink-100 text-pink-700',
    'Year-by-Year': 'bg-indigo-100 text-indigo-700',
    'Investment': 'bg-yellow-100 text-yellow-700',
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
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
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

          {/* Options List - Grouped by Category */}
          <div className="max-h-96 overflow-y-auto">
            {Object.entries(groupedOptions).map(([category, options]) => (
              <div key={category} className="border-b border-gray-100 last:border-b-0">
                {/* Category Header */}
                <div
                  className="flex items-center justify-between px-4 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleCategory(category)}
                >
                  <div className="flex items-center gap-2">
                    <ChevronRight
                      className={`w-4 h-4 text-gray-500 transition-transform ${expandedCategories[category] ? 'rotate-90' : ''}`}
                    />
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${categoryColors[category] || 'bg-gray-100 text-gray-700'}`}>
                      {category}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({options.filter(opt => selectedOptions.includes(opt.id)).length}/{options.length})
                    </span>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => selectAllInCategory(category)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => clearCategory(category)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      None
                    </button>
                  </div>
                </div>

                {/* Category Options */}
                {expandedCategories[category] && (
                  <div className="px-2 py-1">
                    {options.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 cursor-pointer ml-4"
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
                )}
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
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
              <span className="text-xs text-gray-500 font-medium">
                {selectedOptions.length} of {exportOptions.length} selected
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
              Export Selected ({selectedOptions.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Excel Export Utility Functions
export const exportToExcel = (sheets, filename = 'export') => {
  try {
    if (!sheets || sheets.length === 0) {
      alert('No data to export. Please select at least one option.');
      return;
    }

    const workbook = XLSX.utils.book_new();

    sheets.forEach(({ name, data }) => {
      if (!data || data.length === 0) {
        return;
      }

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
    const finalFilename = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Try native download first, fallback to file-saver
    try {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (downloadError) {
      saveAs(blob, finalFilename);
    }
  } catch (error) {
    alert(`Export failed: ${error.message}`);
  }
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
