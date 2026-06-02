import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { HiDownload, HiExternalLink } from 'react-icons/hi';
import toast from 'react-hot-toast';

/**
 * Modal that shows a QR code for a short URL and allows downloading it
 */
export default function QRCodeModal({ isOpen, onClose, url, alias }) {
  const qrRef = useRef(null);

  // Download QR code as SVG
  const handleDownload = () => {
    try {
      const svg = qrRef.current?.querySelector('svg');
      if (!svg) return;
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `qr-${alias || 'link'}.svg`;
      link.click();
      toast.success('QR code downloaded!');
    } catch {
      toast.error('Failed to download QR code');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="QR Code" size="sm">
      <div className="flex flex-col items-center gap-5">
        {/* QR code display */}
        <div
          ref={qrRef}
          className="p-4 bg-white rounded-2xl"
          style={{ lineHeight: 0 }}
        >
          <QRCodeSVG
            value={url || 'https://linksnap.io'}
            size={200}
            bgColor="#ffffff"
            fgColor="#0f1117"
            level="H"
            includeMargin={false}
          />
        </div>

        {/* URL display */}
        <div className="text-center">
          <p className="text-xs text-slate-500 mb-1">Short URL</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-brand-400 font-display font-medium text-sm hover:text-brand-300 transition-colors"
          >
            {url}
            <HiExternalLink className="text-xs" />
          </a>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            variant="brand"
            className="flex-1"
            leftIcon={<HiDownload />}
            onClick={handleDownload}
          >
            Download
          </Button>
        </div>
      </div>
    </Modal>
  );
}