import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HiLink, HiCursorClick, HiGlobe, HiClock, HiPlus, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';

import StatsCard         from '../components/StatsCard';
import UrlTable          from '../components/UrlTable';
import QRCodeModal       from '../components/QRCodeModal';
import EditUrlModal      from '../components/EditUrlModal';
import EmptyState        from '../components/ui/EmptyState';
import Input             from '../components/ui/Input';
import Button            from '../components/ui/Button';
import Card              from '../components/ui/Card';
import { StatsCardSkeleton } from '../components/ui/Skeleton';

import { urlService }    from '../services/urlService';
import { isValidUrl, isValidAlias } from '../utils/validators';

export default function Dashboard() {
  // ── URL list state ────────────────────────────────────────────
  const [urls,        setUrls]        = useState([]);
  const [urlsLoading, setUrlsLoading] = useState(true);

  // ── Create form state ─────────────────────────────────────────
  const [form,        setForm]        = useState({ originalUrl: '', customAlias: '', expiresAt: '' });
  const [formErrors,  setFormErrors]  = useState({});
  const [creating,    setCreating]    = useState(false);
  const [formOpen,    setFormOpen]    = useState(true);

  // ── Modal state ───────────────────────────────────────────────
  const [editUrl,     setEditUrl]     = useState(null);  // url to edit
  const [qrUrl,       setQrUrl]       = useState(null);  // url for QR modal
  const [deleting,    setDeleting]    = useState(null);  // id being deleted

  // ── Fetch all URLs ─────────────────────────────────────────────
  const fetchUrls = useCallback(async () => {
  setUrlsLoading(true);
  try {
    const res = await urlService.getUrls();
    // ✅ Correctly unwrap nested response
    const list = res?.data?.urls ?? res?.urls ?? (Array.isArray(res) ? res : []);
    setUrls(list);
  } catch (err) {
    toast.error(err.message || 'Failed to load links');
  } finally {
    setUrlsLoading(false);
  }
}, []);

  useEffect(() => { fetchUrls(); }, [fetchUrls]);

  // ── Computed stats ─────────────────────────────────────────────
  const totalClicks   = urls.reduce((s, u) => s + (u.clicks || 0), 0);
  const activeUrls    = urls.filter(u => !u.expiresAt || new Date(u.expiresAt) > new Date()).length;
  const todayClicks   = urls.reduce((s, u) => s + (u.todayClicks || 0), 0);

  // ── Create URL ─────────────────────────────────────────────────
  const setField = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setFormErrors(p => ({ ...p, [key]: '' }));
  };

  const validateForm = () => {
    const e = {};
    if (!form.originalUrl)                  e.originalUrl = 'URL is required';
    else if (!isValidUrl(form.originalUrl)) e.originalUrl = 'Enter a valid URL starting with http:// or https://';
    if (form.customAlias && !isValidAlias(form.customAlias))
      e.customAlias = 'Alias must be 3–30 alphanumeric characters or hyphens';
    return e;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    setCreating(true);
    try {
      const payload = { originalUrl: form.originalUrl };
      if (form.customAlias) payload.customAlias = form.customAlias;
      if (form.expiresAt)   payload.expiresAt   = new Date(form.expiresAt).toISOString();

      await urlService.createUrl(payload);
      toast.success('Short link created! 🎉');
      setForm({ originalUrl: '', customAlias: '', expiresAt: '' });
      setFormErrors({});
      fetchUrls(); // refresh list
    } catch (err) {
      toast.error(err.message || 'Failed to create link');
    } finally {
      setCreating(false);
    }
  };

  // ── Delete URL ─────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this link? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await urlService.deleteUrl(id);
      toast.success('Link deleted');
      setUrls(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete link');
    } finally {
      setDeleting(null);
    }
  };

  // ── QR Modal helpers ──────────────────────────────────────────
  const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
  const getShortUrl = (url) => `${BASE_URL}/${url.shortCode}`;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {urlsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
        ) : (
          <>
            <StatsCard icon={HiLink}         label="Total Links"    value={urls.length}                    color="brand"   delay={0}    />
            <StatsCard icon={HiCursorClick}  label="Total Clicks"   value={totalClicks.toLocaleString()}   color="cyan"    delay={0.08} />
            <StatsCard icon={HiGlobe}        label="Active Links"   value={activeUrls}                     color="emerald" delay={0.16} />
            <StatsCard icon={HiClock}        label="Today's Clicks" value={todayClicks.toLocaleString()}   color="violet"  delay={0.24} />
          </>
        )}
      </div>

      {/* ── Create new link form ── */}
      <Card animate delay={0.1}>
        {/* Form header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-semibold text-white text-base">Create Short Link</h3>
            <p className="text-xs text-slate-500 mt-0.5">Shorten any URL with optional custom alias and expiry</p>
          </div>
          <button
            onClick={() => setFormOpen(p => !p)}
            className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {formOpen ? <HiX /> : <HiPlus />}
          </button>
        </div>

        {/* Collapsible form body */}
        <motion.div
          initial={false}
          animate={{ height: formOpen ? 'auto' : 0, opacity: formOpen ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ overflow: 'hidden' }}
        >
          <form onSubmit={handleCreate} className="space-y-4">
            {/* Main URL row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="https://your-very-long-url.com/some/path?with=params"
                  type="url"
                  value={form.originalUrl}
                  onChange={(e) => setField('originalUrl', e.target.value)}
                  error={formErrors.originalUrl}
                  leftIcon={<HiLink className="text-base" />}
                />
              </div>
              <Button
                type="submit"
                loading={creating}
                className="sm:w-36 flex-shrink-0"
                leftIcon={<HiPlus />}
              >
                Shorten
              </Button>
            </div>

            {/* Advanced options */}
            <div className="grid sm:grid-cols-2 gap-3">
              <Input
                label="Custom Alias (optional)"
                type="text"
                placeholder="my-brand"
                value={form.customAlias}
                onChange={(e) => setField('customAlias', e.target.value)}
                error={formErrors.customAlias}
                helperText="e.g. linksnap.io/my-brand"
              />
              <Input
                label="Expiry Date (optional)"
                type="date"
                value={form.expiresAt}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setField('expiresAt', e.target.value)}
              />
            </div>
          </form>
        </motion.div>
      </Card>

      {/* ── URL Table ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-white text-base">
            Your Links
            {!urlsLoading && urls.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-brand-600/20 text-brand-400 text-xs font-medium">
                {urls.length}
              </span>
            )}
          </h3>
          <button
            onClick={fetchUrls}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-display"
          >
            ↻ Refresh
          </button>
        </div>

        {!urlsLoading && urls.length === 0 ? (
          <Card>
            <EmptyState
              icon={HiLink}
              title="No links yet"
              description="Create your first short link above. It only takes a second!"
              action={
                <Button leftIcon={<HiPlus />} onClick={() => setFormOpen(true)}>
                  Create First Link
                </Button>
              }
            />
          </Card>
        ) : (
          <UrlTable
            urls={urls}
            loading={urlsLoading}
            onEdit={setEditUrl}
            onDelete={handleDelete}
            onQR={(url) => setQrUrl(url)}
          />
        )}
      </div>

      {/* ── Modals ── */}
      <EditUrlModal
        isOpen={!!editUrl}
        onClose={() => setEditUrl(null)}
        urlData={editUrl}
        onSuccess={fetchUrls}
      />
      <QRCodeModal
        isOpen={!!qrUrl}
        onClose={() => setQrUrl(null)}
        url={qrUrl ? getShortUrl(qrUrl) : ''}
        alias={qrUrl?.shortCode || ''}
      />
    </div>
  );
}