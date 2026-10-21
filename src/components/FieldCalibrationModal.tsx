import React, { useState } from 'react';
import { Sliders, RotateCcw, ChevronRight, CheckCircle2, Search } from 'lucide-react';
import { FieldCoordinate } from '../types';
import { BOM_FIELD_COORDINATES } from '../services/formCoordinates';

interface FieldCalibrationProps {
  coordinates: FieldCoordinate[];
  onUpdateCoordinate: (id: string, updates: Partial<FieldCoordinate>) => void;
  onResetDefaults: () => void;
}

export const FieldCalibrationView: React.FC<FieldCalibrationProps> = ({
  coordinates,
  onUpdateCoordinate,
  onResetDefaults,
}) => {
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [search, setSearch] = useState('');

  const filteredCoordinates = coordinates.filter(
    (c) =>
      c.page === selectedPage &&
      (search ? c.label.toLowerCase().includes(search.toLowerCase()) || c.id.includes(search) : true)
  );

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Form Coordinate Calibration</h3>
          <p className="text-[11px] text-slate-500">
            Nudge coordinates and letter-spacing for character boxes on the high-res template
          </p>
        </div>
        <button
          onClick={onResetDefaults}
          className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-colors shadow-xs"
        >
          <RotateCcw className="w-3 h-3 text-slate-400" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Page Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 bg-slate-100 border-b border-slate-200 overflow-x-auto text-xs">
        {[1, 2, 3, 5, 6].map((pg) => (
          <button
            key={pg}
            onClick={() => setSelectedPage(pg)}
            className={`px-3 py-1 rounded transition-colors whitespace-nowrap font-medium ${
              selectedPage === pg
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Page {pg} {pg === 1 ? '(CIF/Personal)' : pg === 2 ? '(Address)' : pg === 3 ? '(Services)' : pg === 5 ? '(Nomination)' : ''}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="p-3 border-b border-slate-100">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter fields by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Field List & Coordinate Nudgers */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 text-xs">
        {filteredCoordinates.map((coord) => (
          <div key={coord.id} className="p-3 hover:bg-slate-50/70 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-800">{coord.label}</span>
              <span className="text-[10px] font-mono text-slate-400">{coord.type}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* X position */}
              <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 block mb-1">X: {coord.x.toFixed(1)} pt</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateCoordinate(coord.id, { x: coord.x - 1 })}
                    className="w-6 h-5 bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 text-xs font-mono"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => onUpdateCoordinate(coord.id, { x: coord.x + 1 })}
                    className="w-6 h-5 bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 text-xs font-mono"
                  >
                    +1
                  </button>
                </div>
              </div>

              {/* Y position */}
              <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 block mb-1">Y: {coord.y.toFixed(1)} pt</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateCoordinate(coord.id, { y: coord.y - 1 })}
                    className="w-6 h-5 bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 text-xs font-mono"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => onUpdateCoordinate(coord.id, { y: coord.y + 1 })}
                    className="w-6 h-5 bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 text-xs font-mono"
                  >
                    +1
                  </button>
                </div>
              </div>

              {/* Char spacing (if letter-boxes) */}
              {coord.charSpacing !== undefined && (
                <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block mb-1">
                    Spacing: {coord.charSpacing.toFixed(1)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        onUpdateCoordinate(coord.id, { charSpacing: Math.max(4, (coord.charSpacing || 10) - 0.2) })
                      }
                      className="w-6 h-5 bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 text-xs font-mono"
                    >
                      -
                    </button>
                    <button
                      onClick={() =>
                        onUpdateCoordinate(coord.id, { charSpacing: (coord.charSpacing || 10) + 0.2 })
                      }
                      className="w-6 h-5 bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 text-xs font-mono"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Font size */}
              {coord.fontSize !== undefined && (
                <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block mb-1">
                    Font: {coord.fontSize.toFixed(1)} pt
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        onUpdateCoordinate(coord.id, { fontSize: Math.max(5, (coord.fontSize || 8) - 0.5) })
                      }
                      className="w-6 h-5 bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 text-xs font-mono"
                    >
                      -
                    </button>
                    <button
                      onClick={() =>
                        onUpdateCoordinate(coord.id, { fontSize: (coord.fontSize || 8) + 0.5 })
                      }
                      className="w-6 h-5 bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 text-xs font-mono"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
