import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosClient.js';
import Button from './ui/Button.jsx';
import Dialog from './ui/Dialog.jsx';
import { IconBuilding, IconCheck, IconX, IconPhone, IconEye, IconFilter } from './ui/Icons.jsx';

const ROLE_LABELS = {
  hospital: 'Hospital',
  shelter: 'Shelter',
  rescue_team: 'Rescue Team',
  ngo: 'NGO',
  volunteer: 'Volunteer',
};

export default function EmergencyDirectory({ dark = true }) {
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [documentModal, setDocumentModal] = useState(null); // { user, dataUrl, error, loading }
  const [reviewNote, setReviewNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['users', 'directory'],
    queryFn: async () => (await api.get('/users/directory')).data,
  });

  const reviewDocMutation = useMutation({
    mutationFn: async ({ id, status, note }) =>
      (await api.patch(`/users/${id}/verify-document`, { status, note })).data,
    onSuccess: () => {
      setDocumentModal(null);
      setReviewNote('');
      queryClient.invalidateQueries({ queryKey: ['users', 'directory'] });
    },
  });

  const handleOpenDoc = async (user) => {
    setDocumentModal({ user, loading: true, dataUrl: null, error: null });
    try {
      const res = await api.get(`/users/${user._id}/document`);
      setDocumentModal({
        user,
        loading: false,
        dataUrl: res.data.user.verificationDocument?.dataUrl,
        fileName: res.data.user.verificationDocument?.fileName,
        reviewNote: res.data.user.verificationDocument?.reviewNote,
        error: null,
      });
    } catch {
      setDocumentModal({
        user,
        loading: false,
        dataUrl: null,
        error: 'Unable to load verification document from server.',
      });
    }
  };

  const directory = data?.directory || [];

  const filteredDirectory = directory.filter((entry) => {
    const matchesRole = !roleFilter || entry.role === roleFilter;
    const name = (entry.organizationName || entry.name || '').toLowerCase();
    const matchesSearch = !searchQuery || name.includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div
      className={`rounded-panel p-5 border ${
        dark
          ? 'bg-surfaceDark-panel border-surfaceDark-border text-white'
          : 'bg-white border-line text-slate-900 shadow-panel'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-control bg-blue-100 text-blue-700 flex items-center justify-center">
              <IconBuilding width={14} height={14} />
            </span>
            <h3 className="text-sm font-bold uppercase tracking-wide font-mono">
              Emergency Directory ({filteredDirectory.length})
            </h3>
          </div>
          <p
            className={`text-xs ${
              dark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Registered response units, relief shelters, hospitals, and partner organizations.
          </p>
        </div>

        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by name or organization…"
          className={`min-h-[36px] px-3 text-xs rounded-control border focus:outline-none focus:ring-1 focus:ring-blue-700 ${
            dark
              ? 'bg-surfaceDark-raised border-surfaceDark-border text-white placeholder:text-slate-500'
              : 'bg-white border-line text-slate-900 placeholder:text-slate-400'
          }`}
        />
      </div>

      {/* Role filter chips */}
      <div className="flex items-center gap-1.5 flex-wrap mb-4">
        {[
          { label: 'All', value: '' },
          { label: 'Hospitals', value: 'hospital' },
          { label: 'Shelters', value: 'shelter' },
          { label: 'Rescue Teams', value: 'rescue_team' },
          { label: 'NGOs', value: 'ngo' },
          { label: 'Volunteers', value: 'volunteer' },
        ].map((chip) => (
          <button
            key={chip.value}
            type="button"
            onClick={() => setRoleFilter(chip.value)}
            className={`px-2.5 py-1 text-xs font-mono rounded-control border transition-colors ${
              roleFilter === chip.value
                ? 'bg-blue-700 text-white border-blue-700 font-bold'
                : dark
                ? 'border-surfaceDark-border text-slate-400 hover:text-white hover:bg-surfaceDark-raised'
                : 'border-line text-slate-600 hover:bg-slate-50'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Directory items */}
      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
        {isLoading && (
          <p className="text-xs text-slate-400 font-mono py-4 text-center">Loading emergency directory…</p>
        )}

        {filteredDirectory.map((entry) => {
          const docStatus = entry.documentStatus || 'not_submitted';
          const isPending = docStatus === 'pending';
          const isApproved = docStatus === 'approved';

          return (
            <div
              key={entry._id}
              className={`p-3.5 rounded-control border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                dark ? 'bg-surfaceDark-raised border-surfaceDark-border' : 'bg-slate-50 border-line'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 className="font-bold text-sm truncate">
                    {entry.organizationName || entry.name}
                  </h4>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {ROLE_LABELS[entry.role] || entry.role}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                      isApproved
                        ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300'
                        : isPending
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {docStatus.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap font-mono">
                  {entry.phone && (
                    <a
                      href={`tel:${entry.phone}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <IconPhone width={12} height={12} /> {entry.phone}
                    </a>
                  )}
                  {entry.facility && (
                    <span>
                      Capacity: {entry.facility.capacityUsed}/{entry.facility.capacityTotal} ({entry.facility.status})
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {entry.documentStatus !== 'not_submitted' && (
                  <Button
                    size="sm"
                    variant={dark ? 'outlineDark' : 'secondary'}
                    onClick={() => handleOpenDoc(entry)}
                    icon={<IconEye width={14} height={14} />}
                  >
                    Inspect Document
                  </Button>
                )}

                {isPending && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => reviewDocMutation.mutate({ id: entry._id, status: 'approved' })}
                    loading={reviewDocMutation.isPending}
                    icon={<IconCheck width={12} height={12} />}
                  >
                    Approve
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {!isLoading && filteredDirectory.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-6 font-mono border border-dashed border-line dark:border-surfaceDark-border rounded-control">
            No organization records match the current filter criteria.
          </p>
        )}
      </div>

      {/* Lazy Document Modal */}
      {documentModal && (
        <Dialog
          isOpen={true}
          onClose={() => setDocumentModal(null)}
          title={`Verification Document: ${documentModal.user.organizationName || documentModal.user.name}`}
          description={`Role: ${ROLE_LABELS[documentModal.user.role]} · Status: ${documentModal.user.documentStatus}`}
          maxWidth="max-w-xl"
          dark={dark}
        >
          <div className="space-y-4">
            {documentModal.loading ? (
              <p className="text-center py-8 text-xs font-mono text-slate-400">Loading document image…</p>
            ) : documentModal.error ? (
              <p className="p-3 text-xs rounded bg-coral-100 text-coral-800">{documentModal.error}</p>
            ) : documentModal.dataUrl ? (
              <div className="border border-line dark:border-surfaceDark-border rounded-control p-2 bg-black/5 dark:bg-black/30 flex justify-center">
                <img
                  src={documentModal.dataUrl}
                  alt={`Verification proof for ${documentModal.user.name}`}
                  className="max-h-[60vh] max-w-full object-contain rounded"
                />
              </div>
            ) : (
              <p className="text-xs text-slate-400">No document file available for this user.</p>
            )}

            <div className="pt-2">
              <label className="block text-xs font-semibold mb-1 uppercase font-mono text-slate-400">
                Optional Review Note:
              </label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={2}
                placeholder="Reason for verification decision…"
                className={`w-full p-2.5 text-xs rounded-control border ${
                  dark
                    ? 'bg-surfaceDark-raised border-surfaceDark-border text-white'
                    : 'bg-white border-line text-slate-900'
                }`}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-line dark:border-surfaceDark-border">
              <Button
                variant={dark ? 'outlineDark' : 'secondary'}
                size="sm"
                onClick={() => setDocumentModal(null)}
              >
                Close
              </Button>
              <Button
                variant="critical"
                size="sm"
                onClick={() =>
                  reviewDocMutation.mutate({
                    id: documentModal.user._id,
                    status: 'rejected',
                    note: reviewNote,
                  })
                }
                loading={reviewDocMutation.isPending}
                icon={<IconX width={13} height={13} />}
              >
                Reject Submission
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  reviewDocMutation.mutate({
                    id: documentModal.user._id,
                    status: 'approved',
                    note: reviewNote,
                  })
                }
                loading={reviewDocMutation.isPending}
                icon={<IconCheck width={13} height={13} />}
              >
                Approve Organization
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
