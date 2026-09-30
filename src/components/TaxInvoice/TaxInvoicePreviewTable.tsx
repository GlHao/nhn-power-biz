import { useState } from 'react';
import type { TaxInvoicePreviewDto, TaxInvoicePreviewItemDto } from '../../types/taxInvoice';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';

interface TaxInvoicePreviewTableProps {
  preview: TaxInvoicePreviewDto;
  onUpdatePreview: (preview: TaxInvoicePreviewDto) => void;
}

export function TaxInvoicePreviewTable({ preview, onUpdatePreview }: TaxInvoicePreviewTableProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<TaxInvoicePreviewItemDto>>({});

  const recalculateTotals = (items: TaxInvoicePreviewItemDto[]) => {
    const subtotalExGst = items.reduce((sum, item) => sum + (item.finalAmountExGst || 0), 0);
    const gstAmount = subtotalExGst * 0.1;
    const totalIncGst = subtotalExGst + gstAmount;

    onUpdatePreview({
      ...preview,
      items,
      subtotalExGst,
      gstAmount,
      totalIncGst
    });
  };

  const handleAdd = () => {
    const today = new Date();
    const newItem: TaxInvoicePreviewItemDto = {
      siteId: crypto.randomUUID(),
      siteName: '',
      serviceDate: today.toISOString().split('T')[0] + 'T00:00:00.000Z',
      dayOfWeek: today.getDay(),
      description: '',
      baseAmountExGst: 0,
      extraAmountExGst: 0,
      finalAmountExGst: 0,
      gstAmount: 0,
      finalAmountIncGst: 0,
      note: '',
      status: 'manual_added'
    };
    
    const newItems = [...preview.items, newItem];
    recalculateTotals(newItems);
    setEditingIndex(newItems.length - 1);
    setEditForm(newItem);
  };

  const handleEdit = (index: number, item: TaxInvoicePreviewItemDto) => {
    setEditingIndex(index);
    setEditForm({ ...item });
  };

  const handleSave = () => {
    if (editingIndex === null) return;

    const updatedItem = {
      ...preview.items[editingIndex],
      ...editForm,
      gstAmount: (editForm.finalAmountExGst || 0) * 0.1,
      finalAmountIncGst: (editForm.finalAmountExGst || 0) * 1.1,
      status: editForm.status === 'manual_added' ? 'manual_added' : 'manual_edited'
    } as TaxInvoicePreviewItemDto;

    const newItems = [...preview.items];
    newItems[editingIndex] = updatedItem;

    recalculateTotals(newItems);
    setEditingIndex(null);
    setEditForm({});
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditForm({});
  };

  const handleDelete = (index: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const newItems = [...preview.items];
      newItems.splice(index, 1);
      recalculateTotals(newItems);
      if (editingIndex === index) {
        setEditingIndex(null);
      } else if (editingIndex !== null && index < editingIndex) {
        setEditingIndex(editingIndex - 1);
      }
    }
  };

  const handleChange = (field: keyof TaxInvoicePreviewItemDto, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow border border-border flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold mb-2 text-gray-900">Invoice Details</h2>
          <div className="flex gap-8 text-sm text-gray-700">
            <div>
              <span className="font-semibold">Client:</span> {preview.clientName}
            </div>
            <div>
              <span className="font-semibold">Period:</span> {new Date(preview.periodStart).toLocaleDateString()} - {new Date(preview.periodEnd).toLocaleDateString()}
            </div>
          </div>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition text-sm font-medium"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-border overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-50 border-b border-border text-gray-900">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Site</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Note</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Amount (Ex GST)</th>
              <th className="px-4 py-3 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {preview.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 py-6">
                  No items found for this period.
                </td>
              </tr>
            ) : (
              preview.items.map((item, index) => {
                const isEditing = editingIndex === index;
                
                return (
                  <tr key={`${item.siteId}-${index}`} className={`border-b border-border last:border-0 hover:bg-gray-50 ${isEditing ? 'bg-blue-50/50' : ''}`}>
                    {isEditing ? (
                      <>
                        <td className="px-4 py-2">
                          <input 
                            type="date" 
                            value={editForm.serviceDate ? new Date(editForm.serviceDate).toISOString().split('T')[0] : ''} 
                            onChange={(e) => {
                              const date = new Date(e.target.value);
                              handleChange('serviceDate', date.toISOString());
                              handleChange('dayOfWeek', date.getDay());
                            }}
                            className="w-full border rounded p-1 text-sm text-gray-900 bg-white"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input 
                            type="text" 
                            value={editForm.siteName || ''} 
                            onChange={(e) => handleChange('siteName', e.target.value)}
                            placeholder="Site Name"
                            className="w-full border rounded p-1 text-sm text-gray-900 bg-white"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input 
                            type="text" 
                            value={editForm.description || ''} 
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Description"
                            className="w-full border rounded p-1 text-sm text-gray-900 bg-white"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input 
                            type="text" 
                            value={editForm.note || ''} 
                            onChange={(e) => handleChange('note', e.target.value)}
                            placeholder="Note"
                            className="w-full border rounded p-1 text-sm text-gray-900 bg-white"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap bg-blue-100 text-blue-800`}>
                            {editForm.status?.replace(/_/g, ' ') || 'Editing'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <input 
                            type="number" 
                            step="0.01"
                            value={editForm.finalAmountExGst !== undefined ? editForm.finalAmountExGst : ''} 
                            onChange={(e) => handleChange('finalAmountExGst', parseFloat(e.target.value) || 0)}
                            className="w-24 border rounded p-1 text-sm text-right text-gray-900 bg-white"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex justify-center gap-2">
                            <button onClick={handleSave} className="text-green-600 hover:text-green-800" title="Save">
                              <Check size={18} />
                            </button>
                            <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700" title="Cancel">
                              <X size={18} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 whitespace-nowrap">{new Date(item.serviceDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3">{item.siteName || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{item.description || '-'}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{item.note || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap 
                            ${item.status === 'normal' ? 'bg-green-100 text-green-800' : 
                              item.status === 'manual_added' ? 'bg-purple-100 text-purple-800' : 
                              item.status === 'manual_edited' ? 'bg-blue-100 text-blue-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {item.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">${(item.finalAmountExGst || 0).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-3">
                            <button 
                              onClick={() => handleEdit(index, item)} 
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(index)} 
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border border-border flex flex-col items-end text-sm space-y-2">
        <div className="flex justify-between w-48 text-gray-700">
          <span className="font-medium text-gray-600">Subtotal (Ex GST):</span>
          <span>${preview.subtotalExGst.toFixed(2)}</span>
        </div>
        <div className="flex justify-between w-48 text-gray-700">
          <span className="font-medium text-gray-600">GST (10%):</span>
          <span>${preview.gstAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between w-48 text-lg font-bold text-primary border-t border-border pt-2 mt-2">
          <span>Total (Inc GST):</span>
          <span>${preview.totalIncGst.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
