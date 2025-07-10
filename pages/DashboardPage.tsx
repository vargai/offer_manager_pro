
import React, { useState, useEffect, useCallback } from 'react';
import { OfferRequest, OfferSubmission } from '../types';
import { OfferService } from '../services/OfferService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import { EyeIcon, EditIcon, ChevronDownIcon, PaperClipIcon, LinkIcon } from '../components/common/Icons';

const DashboardPage: React.FC = () => {
  const [offerRequests, setOfferRequests] = useState<OfferRequest[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, OfferSubmission[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<OfferRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const requests = await OfferService.getOfferRequests();
      setOfferRequests(requests);
      
      const subsPromises = requests.map(req => OfferService.getSubmissionsForRequest(req.id));
      const subsResults = await Promise.all(subsPromises);
      const subsMap: Record<string, OfferSubmission[]> = {};
      requests.forEach((req, index) => {
        subsMap[req.id] = subsResults[index];
      });
      setSubmissions(subsMap);

    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      alert("Error: Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleViewDetails = (request: OfferRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleUpdateRequestStatus = async (requestId: string, status: OfferRequest['status']) => {
    try {
      await OfferService.updateOfferRequestStatus(requestId, status);
      fetchDashboardData(); // Refresh data
      if (isModalOpen && selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest(prev => prev ? {...prev, status} : null);
      }
    } catch (error) {
      console.error("Failed to update request status:", error);
      alert("Error: Could not update request status.");
    }
  };

  const toggleExpandRequest = (requestId: string) => {
    setExpandedRequests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };
  
  const getStatusColor = (status: OfferRequest['status'] | OfferSubmission['status']) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Submissions Open': return 'bg-blue-100 text-blue-800';
      case 'Evaluating': return 'bg-indigo-100 text-indigo-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      case 'Submitted': return 'bg-green-100 text-green-800';
      case 'Viewed': return 'bg-purple-100 text-purple-800';
      case 'Shortlisted': return 'bg-pink-100 text-pink-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  if (loading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Offer Dashboard</h1>
      {offerRequests.length === 0 ? (
        <p className="text-center text-gray-500 py-10 text-lg">No offer requests found. Create one to get started!</p>
      ) : (
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {offerRequests.map((request) => (
              <li key={request.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex-1 mb-2 sm:mb-0">
                    <h2 className="text-xl font-semibold text-sky-700 hover:text-sky-600 cursor-pointer" onClick={() => handleViewDetails(request)}>
                      {request.title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Due: {new Date(request.dueDate).toLocaleDateString()} | Created: {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                     <p className={`mt-1 text-xs font-medium px-2 py-0.5 rounded-full inline-block ${getStatusColor(request.status)}`}>
                      {request.status}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                     <span className="text-sm text-gray-600">
                      {submissions[request.id]?.length || 0} / {request.companies.length} submissions
                    </span>
                    <button
                      onClick={() => handleViewDetails(request)}
                      className="p-2 text-sky-600 hover:text-sky-800 hover:bg-sky-100 rounded-full transition-colors"
                      title="View Details"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleExpandRequest(request.id)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                      title={expandedRequests.has(request.id) ? "Collapse Submissions" : "Expand Submissions"}
                    >
                      <ChevronDownIcon className={`w-5 h-5 transition-transform ${expandedRequests.has(request.id) ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
                {expandedRequests.has(request.id) && (
                  <div className="mt-4 pl-4 border-l-2 border-sky-200">
                    <h3 className="text-md font-semibold text-gray-700 mb-2">Submissions ({submissions[request.id]?.length || 0}):</h3>
                    {submissions[request.id]?.length > 0 ? (
                      <ul className="space-y-3">
                        {submissions[request.id].map(sub => (
                          <li key={sub.id} className="p-3 bg-gray-50 rounded-md shadow-sm">
                            <p className="font-medium text-gray-800">{sub.companyName} <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full inline-block ${getStatusColor(sub.status)}`}>{sub.status}</span></p>
                            <p className="text-sm text-gray-600">Contact: {sub.contactPerson} ({sub.contactEmail})</p>
                            <p className="text-sm text-gray-500">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                            {sub.attachments.length > 0 && (
                               <div className="mt-1">
                                {sub.attachments.map(att => (
                                  <a key={att.id} href={att.mockUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 hover:text-sky-800 hover:underline mr-2 inline-flex items-center">
                                    <PaperClipIcon className="w-3 h-3 mr-1" /> {att.name}
                                  </a>
                                ))}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No submissions received yet.</p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedRequest && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Offer Request: ${selectedRequest.title}`} size="xl">
          <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <div>
              <h4 className="font-semibold text-gray-700">Details:</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap"><strong>Description:</strong> {selectedRequest.description}</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap"><strong>Requirements:</strong> {selectedRequest.requirements}</p>
              <p className="text-sm text-gray-600"><strong>Keywords for AI:</strong> {selectedRequest.keywords}</p>
              <p className="text-sm text-gray-600"><strong>Due Date:</strong> {new Date(selectedRequest.dueDate).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600">
                <strong>Status:</strong> 
                <select 
                  value={selectedRequest.status} 
                  onChange={(e) => handleUpdateRequestStatus(selectedRequest.id, e.target.value as OfferRequest['status'])}
                  className="ml-2 p-1 border rounded-md text-sm"
                >
                  <option value="Submissions Open">Submissions Open</option>
                  <option value="Evaluating">Evaluating</option>
                  <option value="Closed">Closed</option>
                </select>
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">Invited Companies ({selectedRequest.companies.length}):</h4>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {selectedRequest.companies.map(company => (
                  <li key={company.id}>
                    {company.name} ({company.email})
                    <button 
                      onClick={() => {
                        const submissionLink = `${window.location.origin}${window.location.pathname}#/submit-offer/${selectedRequest.id}`;
                        navigator.clipboard.writeText(submissionLink).then(() => alert(`Link copied for ${selectedRequest.title}!\n${submissionLink}`)).catch(err => console.error('Failed to copy:', err));
                      }}
                      className="ml-2 text-sky-500 hover:text-sky-700"
                      title="Copy submission link"
                    >
                      <LinkIcon className="w-4 h-4 inline-block" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
             <div>
              <h4 className="font-semibold text-gray-700">Submissions Received ({submissions[selectedRequest.id]?.length || 0}):</h4>
              {submissions[selectedRequest.id]?.length > 0 ? (
                <ul className="space-y-2">
                  {submissions[selectedRequest.id].map(sub => (
                    <li key={sub.id} className="p-3 bg-gray-100 rounded-md shadow-sm">
                      <p className="font-medium text-gray-800">{sub.companyName} - <span className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block ${getStatusColor(sub.status)}`}>{sub.status}</span></p>
                      <p className="text-sm text-gray-600">Contact: {sub.contactPerson} ({sub.contactEmail})</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap"><strong>Details:</strong> {sub.offerDetails}</p>
                      <p className="text-sm text-gray-600"><strong>Pricing:</strong> {sub.pricing}</p>
                      <p className="text-sm text-gray-500">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                       {sub.attachments.length > 0 && (
                         <div className="mt-1">
                           <p className="text-xs font-semibold text-gray-500">Attachments:</p>
                           {sub.attachments.map(att => (
                             <a key={att.id} href={att.mockUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 hover:text-sky-800 hover:underline mr-2 inline-flex items-center">
                               <PaperClipIcon className="w-3 h-3 mr-1" /> {att.name} ({ (att.size / 1024).toFixed(1) } KB)
                             </a>
                           ))}
                         </div>
                       )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No submissions yet for this request.</p>
              )}
            </div>
            <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DashboardPage;
    