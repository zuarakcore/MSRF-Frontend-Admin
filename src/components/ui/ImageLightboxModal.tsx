import React from 'react';
import { Modal } from './Modal';

export interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  caption?: string;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  caption,
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Image Preview'}
      size="lg"
    >
      <div className="flex flex-col items-center justify-center space-y-3 py-1">
        <div className="w-full bg-slate-900/5 rounded-2xl p-2 flex items-center justify-center overflow-hidden border border-slate-200/80 max-h-[60vh]">
          <img
            src={imageUrl}
            alt={title || 'Preview'}
            className="max-h-[55vh] max-w-full w-auto object-contain rounded-xl shadow-md"
          />
        </div>
        {caption && (
          <div className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <p className="text-xs font-medium text-slate-600">{caption}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
