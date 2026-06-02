import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  HiArrowLeft, HiCursorClick, HiGlobe, HiDeviceMobile,
  HiDesktopComputer, HiClock, HiCalendar, HiExternalLink,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { urlService } from '../services/urlService';
import { formatDateTime, formatDate, timeAgo } from '../utils/formatDate';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-sm">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-display font-semibold" style={{ color: p.color }}>
          {p.value} {p.name}
        </p>
      ))}
    </div>
  );
};

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];

export default function Analytics() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL =
    import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ||
    'http://localhost:5000';

  // ✅ SINGLE CLEAN FETCH
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await urlService.getAnalytics(id);
      setData(res.data?.analytics);   // IMPORTANT FIX
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
      toast.error(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  // ── Error ──
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h3 className="text-white text-lg">Failed to load analytics</h3>
        <p className="text-slate-500 text-sm">{error}</p>
        <button onClick={() => navigate('/dashboard')} className="btn-ghost">
          ← Back
        </button>
      </div>
    );
  }

  // ── MAIN DATA ──
  const url = data;

  const shortUrl = `${BASE_URL}/${url.shortCode}`;

  const totalClicks = url.clicks || 0;
  const uniqueVisitors = url.uniqueVisitors || 0;
  const lastVisited = url.lastVisited;

  const dailyClicks = url.dailyClicks || [];
  const browsers = url.browsers || [];
  const devices = url.devices || [];
  const recentVisits = url.recentVisits || [];

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="btn-ghost">
          <HiArrowLeft /> Back
        </button>

        <div>
          <a
            href={shortUrl}
            target="_blank"
            className="text-brand-400 font-bold flex items-center gap-1"
          >
            /{url.shortCode} <HiExternalLink />
          </a>
          <p className="text-slate-500 text-sm">{url.originalUrl}</p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <HiCursorClick />
          <p>{totalClicks}</p>
          <span>Total Clicks</span>
        </div>

        <div className="glass-card p-4">
          <HiGlobe />
          <p>{uniqueVisitors}</p>
          <span>Visitors</span>
        </div>

        <div className="glass-card p-4">
          <HiCalendar />
          <p>{formatDate(url.createdAt)}</p>
          <span>Created</span>
        </div>

        <div className="glass-card p-4">
          <HiClock />
          <p>{lastVisited ? timeAgo(lastVisited) : 'Never'}</p>
          <span>Last Visit</span>
        </div>
      </div>

      {/* DAILY CHART */}
      <Card>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={dailyClicks}>
            <CartesianGrid />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Area dataKey="clicks" stroke="#6366f1" fill="#6366f1" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* PIE CHARTS */}
      <div className="grid md:grid-cols-2 gap-4">

        <Card>
          <h3>Browsers</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={browsers} dataKey="value">
                {browsers.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3>Devices</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={devices}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

      </div>

      {/* RECENT VISITS */}
      <Card>
        <h3>Recent Visits</h3>

        {recentVisits.length === 0 ? (
          <p>No visits yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>Time</th>
                <th>IP</th>
                <th>Browser</th>
                <th>Device</th>
              </tr>
            </thead>
            <tbody>
              {recentVisits.map((v, i) => (
                <tr key={i}>
                  <td>{formatDateTime(v.timestamp || v.visitedAt)}</td>
                  <td>{v.ip || '-'}</td>
                  <td>{v.browser || '-'}</td>
                  <td>{v.device || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}