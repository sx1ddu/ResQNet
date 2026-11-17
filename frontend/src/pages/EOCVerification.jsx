import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosClient.js';
import EOCLayout from '../layouts/EOCLayout.jsx';
import Button from '../components/ui/Button.jsx';
import { Textarea } from '../components/ui/FormField.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import {
  IconShieldCheck,
  IconCheck,
  IconX,
  IconFileText,
  IconClock,
  IconEye,
} from '../components/ui/Icons.jsx';

const ROLE_LABELS = {
  hospital: 'Hospital Administrator',
  shelter: 'Relief Shelter Operator',
  rescue_team: 'Rescue Team Responder',
  ngo: 'Non-Governmental Organization',
  volunteer: 'Community Volunteer',
};

export default function EOCVerification() {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [reviewNote, setReviewNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['users', 'directory'],
    queryFn: async () => (await api.get('/users/directory')).data,
  });

  const directory = data?.directory || [];
  const pendingOrgs = directory.filter((u) => u.documentStatus === 'pending');
  const allVerifiedOrgs = directory.filter((u) => u.documentStatus !== 'not_submitted');

  const selectedUser =
    directory.find((u) => u._id === selectedUserId) ||
    pendingOrgs[0] ||
    allVerifiedOrgs[0] ||
    null;

  // Lazy document fetch for the selected user
  const {
    data: docData,
    isLoading: docLoading,
    error: docError,
  } = useQuery({
    queryKey: ['users', selectedUser?._id, 'document'],
    queryFn: async () => (await api.get(`/users/${selectedUser._id}/document`)).data,
    enabled: Boolean(selectedUser?._id && selectedUser.documentStatus !== 'not_submitted'),
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status }) =>
      (await api.patch(`/users/${id}/verify-document`, { status, note: reviewNote })).data,
    onSuccess: () => {
      setReviewNote('');
      queryClient.invalidateQueries({ queryKey: ['users', 'directory'] });
      queryClient.invalidateQueries({ queryKey: ['users', selectedUser?._id, 'document'] });
    },
  });

  return (
    <EOCLayout>
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-mono font-bold uppercase text-blue-400 tracking-wider mb-1">
            Governance & Organization Accreditation
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Organization Verification Queue
            </h1>
            <span className="px-2.5 py-0.5 rounded-badge text-xs font-mono font-bold uppercase bg-amber-950 text-amber-300 border border-amber-800">
              {pendingOrgs.length} Pending Review
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Review uploaded identification and agency credentials before granting permissions for field operations or capacity updates.
          </p>
        </div>

        {/* 2-Column: Left Pending Queue | Right Document Inspection Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Organization List (4 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="p-4 rounded-panel bg-surfaceDark-panel border border-surfaceDark-border space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-surfaceDark-border">
                Submissions ({allVerifiedOrgs.length})
              </h3>

              {isLoading && (
                <p className="text-center py-8 text-xs font-mono text-slate-400">Loading submissions…</p>
              )}

              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                {allVerifiedOrgs.map((entry) => {
                  const isSelected = selectedUser?._id === entry._id;
                  const isPending = entry.documentStatus === 'pending';
                  const isApproved = entry.documentStatus === 'approved';

                  return (
                    <div
                      key={entry._id}
                      onClick={() => setSelectedUserId(entry._id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setSelectedUserId(entry._id);
                      }}
                      className={`p-3.5 rounded-control border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-surfaceDark-highlight border-blue-600'
                          : 'bg-surfaceDark-raised border-surfaceDark-border hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                          {entry.organizationName || entry.name}
                        </h4>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold shrink-0 ${
                            isApproved
                              ? 'bg-teal-950 text-teal-300 border border-teal-800'
                              : isPending
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-coral-950 text-coral-300 border border-coral-800'
                          }`}
                        >
                          {entry.documentStatus}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400">
                        {ROLE_LABELS[entry.role] || entry.role}
                      </p>
                      {entry.phone && (
                        <p className="text-[11px] font-mono text-slate-500 mt-1">📞 {entry.phone}</p>
                      )}
                    </div>
                  );
                })}

                {!isLoading && allVerifiedOrgs.length === 0 && (
                  <p className="text-center py-10 text-xs text-slate-400 font-mono">
                    No organizations requiring document verification.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Document Inspection & Review (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {selectedUser ? (
              <div className="p-6 rounded-panel bg-surfaceDark-panel border border-surfaceDark-border space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3 border-b border-surfaceDark-border">
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {selectedUser.organizationName || selectedUser.name}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Role: {ROLE_LABELS[selectedUser.role]} · Account: {selectedUser.email}
                    </p>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono uppercase font-bold self-start ${
                      selectedUser.documentStatus === 'approved'
                        ? 'bg-teal-950 text-teal-300 border border-teal-800'
                        : selectedUser.documentStatus === 'pending'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-coral-950 text-coral-300 border border-coral-800'
                    }`}
                  >
                    Status: {selectedUser.documentStatus}
                  </span>
                </div>

                {/* Document Image Preview Container */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1.5 font-bold uppercase">
                      <IconFileText width={14} height={14} /> Attached Document Evidence
                    </span>
                    {docData?.user?.verificationDocument?.fileName && (
                      <span>File: {docData.user.verificationDocument.fileName}</span>
                    )}
                  </div>

                  <div className="min-h-[280px] max-h-[440px] rounded-control border border-surfaceDark-border bg-ink-950/70 p-4 flex items-center justify-center overflow-auto">
                    {docLoading ? (
                      <p className="text-xs font-mono text-slate-400">Loading document image…</p>
                    ) : docError ? (
                      <p className="text-xs text-coral-400">Could not retrieve verification document.</p>
                    ) : docData?.user?.verificationDocument?.dataUrl ? (
                      <img
                        src={docData.user.verificationDocument.dataUrl}
                        alt={`Verification proof for ${selectedUser.name}`}
                        className="max-h-[380px] max-w-full object-contain rounded shadow-md"
                      />
                    ) : (
                      <div className="text-center text-slate-500 space-y-1">
                        <IconFileText width={32} height={32} className="mx-auto text-slate-600" />
                        <p className="text-xs font-mono">No document file available for this record.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Prior Review Note (if already reviewed) */}
                {docData?.user?.verificationDocument?.reviewNote && (
                  <div className="p-3 rounded-control bg-surfaceDark-raised border border-surfaceDark-border text-xs">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                      Existing Review Note:
                    </span>
                    <p className="text-slate-300 italic">
                      "{docData.user.verificationDocument.reviewNote}"
                    </p>
                  </div>
                )}

                {/* Review Action Form */}
                <div className="pt-2 border-t border-surfaceDark-border space-y-3">
                  <label className="block text-xs font-mono uppercase text-slate-400 font-semibold">
                    Review Decision Note (Optional):
                  </label>
                  <Textarea
                    rows={2}
                    dark={true}
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Enter reason for verification approval or rejection notes for the organization…"
                    className="text-xs"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <Button
                      size="md"
                      variant="primary"
                      onClick={() => reviewMutation.mutate({ id: selectedUser._id, status: 'approved' })}
                      loading={reviewMutation.isPending}
                      icon={<IconCheck width={15} height={15} />}
                      className="font-mono text-xs uppercase"
                    >
                      Approve Organization Accreditation
                    </Button>

                    <Button
                      size="md"
                      variant="critical"
                      onClick={() => reviewMutation.mutate({ id: selectedUser._id, status: 'rejected' })}
                      loading={reviewMutation.isPending}
                      icon={<IconX width={15} height={15} />}
                      className="font-mono text-xs uppercase"
                    >
                      Reject Submission
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                title="Select an organization"
                description="Choose an organization from the submissions queue to inspect their uploaded identification."
                dark={true}
              />
            )}
          </div>
        </div>
      </div>
    </EOCLayout>
  );
}
