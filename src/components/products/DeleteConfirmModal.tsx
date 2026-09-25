import React, { useState } from 'react';
import { Product } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useProducts } from '../../contexts/ProductContext';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { deleteProduct } = useProducts();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!product) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const result = await deleteProduct(product.id);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Failed to delete product.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while deleting.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={
        <div className="flex items-center gap-2 text-rose-600">
          <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <Trash2 className="w-4 h-4" />
          </div>
          <span>Delete Product</span>
        </div>
      }
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
            icon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete Item
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        <p className="text-sm text-slate-600">
          Are you sure you want to delete <strong className="text-slate-900">{product.name}</strong>?
        </p>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
          <div className="flex justify-between text-slate-500">
            <span>SKU:</span>
            <span className="font-mono font-semibold text-slate-800">{product.sku}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Category:</span>
            <span className="font-semibold text-slate-800">{product.category}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Current Stock:</span>
            <span className="font-semibold text-slate-800">{product.quantity} {product.unit || 'pcs'}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            This action will permanently remove this item from the active catalog and Point-of-Sale terminal product picker.
          </p>
        </div>
      </div>
    </Modal>
  );
};
