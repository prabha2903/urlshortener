import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiClipboard, HiClipboardCheck, HiPencil, HiTrash,
  HiQrcode, HiChartBar, HiExternalLink, HiChevronUp, HiChevronDown,
} from 'react-icons/hi';
import Badge from './ui/Badge';
import { useClipboard } from '../hooks/useClipboard';
import { formatDate, timeAgo } from '../utils/formatDate';
import { TableRowSkeleton } from './ui/Skeleton';

/**
 * Full URL list table with sorting, copy, edit, delete, analytics, QR actions
 */
export default function UrlTable({ urls, loading, onEdit, onDelete, onQR }) {
  const navigate = useNavigate();
  const { copy, copied } = useClipboard();
  const [copiedId, setCopiedId] = useState(null);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir,   setSortDir]   = useState('desc');

  // ── Sorting ──────────────────────────────────────────────────
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sorted = [...(urls || [])].sort((a, b) => {
    let va = a[sortField];
    let vb = b[sortField];
    if (sortField === 'clicks') {
      va = a.clicks || 0;
      vb = b.clicks || 0;
    } else if (sortField === 'createdAt') {
      va = new Date(a.createdAt);
      vb = new Date(b.createdAt);
    }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // ── Copy handler with per-row feedback ───────────────────────
  const handleCopy = (url, id) => {
    copy(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ── Check if URL is expired ───────────────────────────────────
  const isExpired = (url) =>
    url.expiresAt && new Date(url.expiresAt) < new Date();

  // ── Sort header component ─────────────────────────────────────
  const SortTh = ({ field, children }) => (
    <th
      className="px-4 py-3 text-left text-[10px] font-display font-semibold uppercase tracking-widest text-slate-500 cursor-pointer hover:text-slate-300 transition-colors select-none"
      onClick={() => toggleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field ? (
          sortDir === 'asc'
            ? <HiChevronUp className="text-brand-400" />
            : <HiChevronDown className="text-brand-400" />
        ) : (
          <HiChevronDown className="opacity-30" />
        )}
      </div>
    </th>
  );

  return (
    <div className="glass-card overflow-hidden" style={{ padding: 0 }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-1/50 border-b border-white/[0.06]">
            <tr>
              <SortTh field="shortCode">Short URL</SortTh>
              <th className="px-4 py-3 text-left text-[10px] font-display font-semibold uppercase tracking-widest text-slate-500">Original URL</th>
              <SortTh field="clicks">Clicks</SortTh>
              <SortTh field="createdAt">Created</SortTh>
              <th className="px-4 py-3 text-left text-[10px] font-display font-semibold uppercase tracking-widest text-slate-500">Status</th>
              <th className="px-4 py-3 text-right text-[10px] font-display font-semibold uppercase tracking-widest text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableRowSkeleton rows={6} />
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                  No links yet — create your first one above!
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {sorted.map((url, index) => {
                  const shortUrl = `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/${url.shortCode}`;
                  const expired  = isExpired(url);

                  return (
                    <motion.tr
                      key={url._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Short URL */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-medium text-brand-400 text-sm whitespace-nowrap">
                            /{url.shortCode}
                          </span>
                          <a
                            href={shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-300"
                          >
                            <HiExternalLink className="text-xs" />
                          </a>
                        </div>
                      </td>

                      {/* Original URL */}
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-slate-300 text-sm truncate" title={url.originalUrl}>
                          {url.originalUrl}
                        </p>
                      </td>

                      {/* Clicks */}
                      <td className="px-4 py-3">
                        <span className="font-display font-bold text-white text-sm">
                          {(url.clicks || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-4 py-3">
                        <span className="text-slate-500 text-xs">{formatDate(url.createdAt)}</span>
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3">
                        {expired ? (
                          <Badge variant="danger">Expired</Badge>
                        ) : url.expiresAt ? (
                          <Badge variant="warning">Expires {timeAgo(url.expiresAt)}</Badge>
                        ) : (
                          <Badge variant="success">Active</Badge>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {/* Copy */}
                          <button
                            onClick={() => handleCopy(shortUrl, url._id)}
                            title="Copy short URL"
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-brand-400 transition-colors"
                          >
                            {copiedId === url._id
                              ? <HiClipboardCheck className="text-sm text-brand-400" />
                              : <HiClipboard className="text-sm" />
                            }
                          </button>

                          {/* QR code */}
                          <button
                            onClick={() => onQR(url)}
                            title="Show QR code"
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-cyan-400 transition-colors"
                          >
                            <HiQrcode className="text-sm" />
                          </button>

                          {/* Analytics */}
                          <button
                            onClick={() => navigate(`/analytics/${url._id}`)}
                            title="View analytics"
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-violet-400 transition-colors"
                          >
                            <HiChartBar className="text-sm" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEdit(url)}
                            title="Edit link"
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-amber-400 transition-colors"
                          >
                            <HiPencil className="text-sm" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => onDelete(url._id)}
                            title="Delete link"
                            className="p-1.5 rounded-lg hover:bg-rose-500/15 text-slate-500 hover:text-rose-400 transition-colors"
                          >
                            <HiTrash className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with count */}
      {!loading && sorted.length > 0 && (
        <div className="px-4 py-3 border-t border-white/[0.04] flex items-center justify-between">
          <p className="text-xs text-slate-600">
            Showing <span className="text-slate-400">{sorted.length}</span> link{sorted.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}