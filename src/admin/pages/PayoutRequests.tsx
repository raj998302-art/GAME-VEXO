import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { CheckCircle, XCircle, CreditCard, ExternalLink, Calendar } from 'lucide-react';

export default function PayoutRequests() {
  const [payouts, setPayouts] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'payouts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPayouts(data);
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'payouts', id), { status: newStatus });
    } catch (e) {
      console.error(e);
      alert("Failed to update status.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-text-main flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-primary-color" />
          Payout Requests
        </h1>
        <p className="text-text-dim">Manage developer revenue share applications.</p>
      </div>

      <div className="bg-card-bg border border-border-color rounded-[20px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-bg-dark text-text-dim text-sm">
              <tr>
                <th className="px-6 py-4 font-medium border-b border-border-color">Developer</th>
                <th className="px-6 py-4 font-medium border-b border-border-color">Amount</th>
                <th className="px-6 py-4 font-medium border-b border-border-color">Payment Details</th>
                <th className="px-6 py-4 font-medium border-b border-border-color">Proof/Stats</th>
                <th className="px-6 py-4 font-medium border-b border-border-color">Status</th>
                <th className="px-6 py-4 font-medium border-b border-border-color">Date</th>
                <th className="px-6 py-4 font-medium text-right border-b border-border-color">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {payouts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-text-dim">No payout requests found.</td>
                </tr>
              )}
              {payouts.map((payout) => (
                <tr key={payout.id} className="hover:bg-white/5 transition-colors text-sm">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-text-main">{payout.userName}</div>
                    <div className="text-xs text-text-dim">{payout.email}</div>
                  </td>
                  <td className="px-6 py-4 text-green-500 font-bold">${payout.amountRequested}</td>
                  <td className="px-6 py-4 text-text-dim font-mono max-w-[200px] truncate" title={payout.upiDetails}>{payout.upiDetails}</td>
                  <td className="px-6 py-4">
                    <a href={payout.proofScreenshotUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary-color hover:underline">
                      <ExternalLink className="w-4 h-4" /> View Proof
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      payout.status === 'approved' ? 'bg-green-500/20 text-green-500' : 
                      payout.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-red-500/20 text-red-500'
                    }`}>
                      {payout.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-dim flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {payout.createdAt?.toDate ? payout.createdAt.toDate().toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                       {payout.status === 'pending' && (
                         <>
                           <button onClick={() => handleStatusChange(payout.id, 'approved')} className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors" title="Mark Paid">
                             <CheckCircle className="w-4 h-4" />
                           </button>
                           <button onClick={() => handleStatusChange(payout.id, 'rejected')} className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors" title="Reject">
                             <XCircle className="w-4 h-4" />
                           </button>
                         </>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
